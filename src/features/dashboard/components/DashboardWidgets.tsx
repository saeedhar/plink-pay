import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTooltip, VictoryVoronoiContainer } from 'victory';
import placeholderChart from '../../../assets/dashboard/placeholderchart.svg';
import upIcon from '../../../assets/dashboard/up.svg';
import walletIcon from '../../../assets/dashboard/wallet.svg';
import onholdIcon from '../../../assets/onhold.svg';
import { TransactionService, WalletBalanceResponse } from '../../../services/transactionService';
import { WalletService, SubWalletData } from '../../../services/walletService';

interface DashboardWidgetsProps {
  subWalletName?: string;
  subWalletId?: string;
  isSubWallet?: boolean;
}

const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ subWalletName, subWalletId, isSubWallet }) => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('Last week');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<WalletBalanceResponse | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [subWalletData, setSubWalletData] = useState<SubWalletData | null>(null);
  const [isLoadingSubWallet, setIsLoadingSubWallet] = useState(false);
  const [subWalletError, setSubWalletError] = useState<string | null>(null);

  const periods = ['Last week', 'Last month', 'Last year'];

  // Fetch wallet balance on component mount or when sub-wallet changes
  useEffect(() => {
    const loadWalletBalance = async () => {
      try {
        setIsLoadingBalance(true);
        setBalanceError(null);
        // Pass subWalletId if viewing a sub-wallet
        const balance = await TransactionService.getWalletBalance(isSubWallet ? subWalletId : undefined);
        setWalletBalance(balance);
        console.log('🔍 Wallet balance loaded:', balance, isSubWallet ? `(sub-wallet: ${subWalletId})` : '(main wallet)');
      } catch (error) {
        console.error('Error loading wallet balance:', error);
        setBalanceError(error instanceof Error ? error.message : 'Failed to load balance');
      } finally {
        setIsLoadingBalance(false);
      }
    };

    loadWalletBalance();
    
    // Also reload when component becomes visible (handles back navigation)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 DashboardWidgets: Page visible again, reloading balance...');
        loadWalletBalance();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSubWallet, subWalletId]);

  // Fetch sub-wallet data when sub-wallet is selected
  useEffect(() => {
    const loadSubWalletData = async () => {
      if (isSubWallet && subWalletId) {
        try {
          setIsLoadingSubWallet(true);
          setSubWalletError(null);
          const subWallet = await WalletService.getSubWalletDetails(subWalletId);
          setSubWalletData(subWallet);
          console.log('🔍 Sub-wallet data loaded:', subWallet);
        } catch (error) {
          console.error('Error loading sub-wallet data:', error);
          setSubWalletError(error instanceof Error ? error.message : 'Failed to load sub-wallet data');
        } finally {
          setIsLoadingSubWallet(false);
        }
      } else {
        // Clear sub-wallet data when not viewing a sub-wallet
        setSubWalletData(null);
        setSubWalletError(null);
      }
    };

    loadSubWalletData();
    
    // Also reload when component becomes visible (handles back navigation)
    const handleVisibilityChange = () => {
      if (!document.hidden && isSubWallet && subWalletId) {
        console.log('🔄 DashboardWidgets: Page visible again, reloading sub-wallet data...');
        loadSubWalletData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSubWallet, subWalletId]);

  // Memoized chart data to prevent re-renders
  const chartData = useMemo(() => {
    const chartDataSets = {
      'Last week': [
        { x: 'Mon', y: 20 },
        { x: 'Tue', y: 25 },
        { x: 'Wed', y: 15 },
        { x: 'Thu', y: 30 },
        { x: 'Fri', y: 35 },
        { x: 'Sat', y: 28 },
        { x: 'Sun', y: 22 }
      ],
      'Last month': [
        { x: 'Week 1', y: 120 },
        { x: 'Week 2', y: 145 },
        { x: 'Week 3', y: 98 },
        { x: 'Week 4', y: 167 }
      ],
      'Last year': [
        { x: 'Q1', y: 450 },
        { x: 'Q2', y: 520 },
        { x: 'Q3', y: 380 },
        { x: 'Q4', y: 610 }
      ]
    };

    return chartDataSets[selectedPeriod as keyof typeof chartDataSets];
  }, [selectedPeriod]);

  // Memoized chart style
  const chartStyle = useMemo(() => ({
    data: {
      stroke: '#1F2937',
      strokeWidth: 3,
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    }
  }), []);

  // Memoized tooltip component
  const CustomTooltip = useCallback((props: any) => {
    return (
      <div className="victory-tooltip">
        ${props.datum.y}.00
      </div>
    );
  }, []);

  const handlePeriodChange = useCallback((period: string) => {
    setSelectedPeriod(period);
    setIsDropdownOpen(false);
  }, []);

  return (
    <div className="dashboard-widgets">
      {/* Balance Card */}
      <div className="widget balance-card">
        <div className="on-hold-balance" onClick={() => navigate('/app/onhold-balance', {
          state: {
            subWalletId: isSubWallet ? subWalletId : undefined,
            isSubWallet: isSubWallet,
            subWalletName: subWalletName
          }
        })}>
          <div className="on-hold-icon">
            <img src={onholdIcon} alt="On Hold" className="on-hold-icon-img" />
          </div>
          <span className="on-hold-text">
            On Hold Balance: {
              isSubWallet ? (
                // Show sub-wallet on-hold balance
                isLoadingSubWallet ? 'Loading...' : subWalletError ? 'Error' : subWalletData ? TransactionService.formatCurrency(subWalletData.onHoldBalance, 'SAR') : '0.00 SAR'
              ) : (
                // Show main wallet on-hold balance
                isLoadingBalance ? 'Loading...' : balanceError ? 'Error' : walletBalance ? TransactionService.formatCurrency(walletBalance.onHoldBalance, walletBalance.currency) : '0.00 SAR'
              )
            }
          </span>
        </div>
        {isSubWallet && subWalletName && (
          <h2 className="subwallet-name">{subWalletName}</h2>
        )}
        <h3 className="widget-title">Your Balance</h3>
        <div className="balance-amount">
          {isSubWallet ? (
            // Show sub-wallet balance
            isLoadingSubWallet ? 'Loading...' : subWalletError ? 'Error' : subWalletData ? TransactionService.formatCurrency(subWalletData.availableBalance, 'SAR') : '0.00 SAR'
          ) : (
            // Show main wallet balance
            isLoadingBalance ? 'Loading...' : balanceError ? 'Error' : walletBalance ? TransactionService.formatCurrency(walletBalance.availableBalance, walletBalance.currency) : '0.00 SAR'
          )}
        </div>
        <div className="balance-change">
          <img src={upIcon} alt="Up" className="change-icon" />
          <span className="change-text positive">+0.5%</span>
        </div>
        <button className="wallets-button" onClick={() => navigate('/app/services/wallet/subwallet')}>
          <img src={walletIcon} alt="Wallet" className="button-icon" />
          Wallets
        </button>
      </div>

      {/* Activity Graph */}
      <div className="widget activity-graph">
        <div className="widget-header">
          <h3 className="widget-title">Activity</h3>
          <div className="dropdown-container">
            <div 
              className="dropdown" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{selectedPeriod}</span>
              <div className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`}>▼</div>
            </div>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                {periods.map((period) => (
                  <div 
                    key={period}
                    className="dropdown-item"
                    onClick={() => handlePeriodChange(period)}
                  >
                    {period}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="graph-container">
          <div className="line-graph">
             <VictoryChart
               height={180}
               padding={{ left: 40, right: 40, top: 40, bottom: 60 }}
               domainPadding={{ x: 30, y: 20 }}
               containerComponent={
                 <VictoryVoronoiContainer
                   voronoiDimension="x"
                   labels={({ datum }) => `$${datum.y}.00`}
                   labelComponent={
                     <VictoryTooltip
                       flyoutStyle={{
                         fill: '#10B981',
                         stroke: 'none',
                         strokeWidth: 0
                       }}
                       style={{
                         fill: 'white',
                         fontSize: 12,
                         fontWeight: 600
                       }}
                       cornerRadius={6}
                       pointerLength={8}
                     />
                   }
                 />
               }
             >
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: 'transparent' },
                  ticks: { stroke: 'transparent' },
                  tickLabels: { fill: 'transparent' }
                }}
              />
              <VictoryAxis
                style={{
                  axis: { stroke: 'transparent' },
                  ticks: { stroke: 'transparent' },
                  tickLabels: { 
                    fill: '#9CA3AF',
                    fontSize: 12,
                    fontWeight: 500
                  }
                }}
              />
              <VictoryLine
                data={chartData}
                style={chartStyle}
                interpolation="cardinal"
                animate={{
                  duration: 300,
                  onLoad: { duration: 300 }
                }}
              />
            </VictoryChart>
          </div>
        </div>
      </div>

      {/* Spending Breakdown */}
      <div className="widget spending-breakdown">
        <h3 className="widget-title">Spending Breakdown</h3>
        <div className="pie-chart">
          <img src={placeholderChart} alt="Spending Chart" className="chart-image" />
        </div>
      </div>
    </div>
  );
};

export default DashboardWidgets;
