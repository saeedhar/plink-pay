import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTooltip, VictoryVoronoiContainer } from 'victory';
import placeholderChart from '../../../assets/dashboard/placeholderchart.svg';
import upIcon from '../../../assets/dashboard/up.svg';
import walletIcon from '../../../assets/dashboard/wallet.svg';
import onholdIcon from '../../../assets/onhold.svg';

interface DashboardWidgetsProps {
  subWalletName?: string;
  isSubWallet?: boolean;
}

const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ subWalletName, isSubWallet }) => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('Last week');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const periods = ['Last week', 'Last month', 'Last year'];

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
        <div className="on-hold-balance" onClick={() => navigate('/app/onhold-balance')}>
          <div className="on-hold-icon">
            <img src={onholdIcon} alt="On Hold" className="on-hold-icon-img" />
          </div>
          <span className="on-hold-text">On Hold Balance : 400 SAR</span>
        </div>
        {isSubWallet && subWalletName && (
          <h2 className="subwallet-name">{subWalletName}</h2>
        )}
        <h3 className="widget-title">Your Balance</h3>
        <div className="balance-amount">SAR 2.400,00</div>
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
