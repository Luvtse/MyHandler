def detect_cash_flow_anomaly():
    actual_cash = get_actual_cash_flow()
    forecasted = get_forecasted_cash_flow()
    variance = (forecasted - actual_cash) / forecasted
    
    if variance > 0.15:  # 15% drop
        return {
            "title": "Cash Flow Anomaly Detected",
            "message": f"Cash inflow dropped {variance*100:.0f}% vs forecast due to delayed client payments.",
            "confidence": 0.96,
            "severity": "high",
            "recommendation": "Follow up with top 3 delinquent accounts."
        }
    return None

def analyze_marketing_roi():
    campaigns = get_campaign_performance()
    underperformers = [c for c in campaigns if c['roi'] < 0.10]
    
    if underperformers:
        worst = min(underperformers, key=lambda x: x['roi'])
        return {
            "title": "Marketing ROI Alert",
            "message": f"{worst['channel']} campaign ROI fell to {worst['roi']*100:.1f}% (target: ≥10%).",
            "confidence": 0.88,
            "severity": "medium",
            "recommendation": f"Reallocate budget to {get_best_channel()} with {get_best_roi()*100:.1f}% ROI."
        }
    return None