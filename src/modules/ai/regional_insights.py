def get_regional_insights(region):
    metrics = get_regional_metrics(region)
    insights = []
    
    # Fleet overutilization
    if metrics['fleet_utilization'] > 90:
        insights.append({
            "title": "Fleet Overutilization Alert",
            "message": f"Fleet utilization in {region} is at {metrics['fleet_utilization']}%. Risk of vehicle breakdowns.",
            "confidence": 0.89,
            "severity": "medium",
            "recommendation": "Request additional vehicles from central pool or rebalance routes."
        })
    
    # On-time delivery drop
    if metrics['on_time_delivery'] < 90:
        insights.append({
            "title": "On-Time Delivery at Risk",
            "message": f"On-time delivery in {region} is {metrics['on_time_delivery']}% (below 90% target).",
            "confidence": 0.92,
            "severity": "medium",
            "recommendation": "Review route planning and driver assignments."
        })
    
    return insights