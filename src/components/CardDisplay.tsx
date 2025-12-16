import React from 'react';
import { CardResponse } from '../services/cardAPI';
import masterCardIcon from '../assets/topup/cards/master-card.svg';
import visaMadaIcon from '../assets/topup/cards/visa-mada.svg';
import visaIcon from '../assets/topup/cards/visa.svg';

interface CardDisplayProps {
  card: CardResponse;
  className?: string;
  largeText?: boolean; // If true, uses larger font sizes for card number, name, and expiry
  smallText?: boolean; // If true, uses smaller font sizes for card number, name, and expiry
}

/**
 * Formats expiry date from month/year to MM/YY
 */
const formatExpiryDate = (month: string, year: string): string => {
  const formattedMonth = month.padStart(2, '0');
  const formattedYear = year.length === 4 ? year.slice(-2) : year;
  return `${formattedMonth}/${formattedYear}`;
};

/**
 * Gets the appropriate SVG card image based on card type
 */
const getCardImage = (cardType: string): string => {
  if (cardType === 'MADA') {
    return visaMadaIcon;
  } else if (cardType === 'MASTERCARD') {
    return masterCardIcon;
  } else {
    return visaIcon;
  }
};

/**
 * Formats card number to show only last 4 digits with mask
 * Uses spaces between groups for proper word spacing
 */
const formatCardNumber = (last4Digits: string): string => {
  return `**** **** **** ${last4Digits}`;
};

const CardDisplay: React.FC<CardDisplayProps> = ({ card, className = '', largeText = false, smallText = false }) => {
  const cardImage = getCardImage(card.cardType);
  const expiryDate = formatExpiryDate(card.expiryMonth, card.expiryYear);
  const cardNumber = formatCardNumber(card.last4Digits);
  
  // Font sizes based on largeText and smallText props
  const cardNumberSize = largeText ? '28px' : smallText ? '18px' : '22px';
  const cardholderNameSize = largeText ? '16px' : smallText ? '11px' : '13px';
  const expiryDateSize = largeText ? '16px' : smallText ? '11px' : '13px';
  const expiryLabelSize = largeText ? '12px' : smallText ? '9px' : '10px';

  return (
    <div 
      className={`card-display-wrapper ${className}`} 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center'
      }}
    >
      {/* SVG Card Background */}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <img 
          src={cardImage} 
          alt={`${card.cardType} Card`}
          style={{ 
            width: '100%', 
            height: '100%',
            objectFit: 'contain',
            display: 'block'
          }}
        />
        
        {/* Card Data Overlay - positioned absolutely over the card */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: smallText ? '16px 14px 12px 14px' : '20px 18px 16px 18px',
            color: '#FFFFFF',
            fontFamily: 'Arial, Helvetica, sans-serif',
            pointerEvents: 'none',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ 
            fontSize: cardNumberSize,
            letterSpacing: '0.5px',
            fontWeight: '400',
            textAlign: 'left',
            lineHeight: '1.4',
            color: '#FFFFFF',
            marginTop: 'auto',
            marginBottom: 'auto',
            fontFamily: 'Arial, Helvetica, sans-serif',
          }}>
            {cardNumber}
          </div>
          
          <div style={{ 
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
            fontSize: '13px',
            fontWeight: '400',
            lineHeight: '1',
            width: '100%',
            marginBottom: smallText ? '6px' : '8px',
            gap: smallText ? '18px' : '24px'
          }}>
            <div style={{ 
              textTransform: 'uppercase', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              letterSpacing: '0.5px',
              color: '#FFFFFF',
              fontSize: cardholderNameSize,
              fontWeight: '400',
              textAlign: 'left',
              flexShrink: 0
            }}>
              {card.cardholderName}
            </div>
            
            {/* Expiry Date - label on top, date on bottom */}
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '2px',
              flexShrink: 0
            }}>
              <span style={{ 
                fontSize: expiryLabelSize, 
                opacity: 0.9,
                fontWeight: '400',
                color: '#FFFFFF',
                letterSpacing: '0.3px',
                lineHeight: '1'
              }}>
                Expiry Date
              </span>
              <span style={{ 
                whiteSpace: 'nowrap',
                letterSpacing: '0.5px',
                color: '#FFFFFF',
                fontSize: expiryDateSize,
                fontWeight: '400',
                lineHeight: '1'
              }}>
                {expiryDate}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDisplay;
