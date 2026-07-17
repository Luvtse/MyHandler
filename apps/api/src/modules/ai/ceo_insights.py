def detect_cross_functional_risks():
    # Example: Link operations delay to revenue impact
    delivery_rate = get_metric("on_time_delivery")
    revenue_growth = get_metric("ytd_growth")
    
    if delivery_rate < 93 and revenue_growth < 10:
        return {
            "title": "Revenue Growth at Risk",
            "message": f"Q1 growth slowed to {revenue_growth}% MoM (target: 12%) due to customs delays.",
            "confidence": 0.91,
            "severity": "medium",
            "recommendation": "Accelerate Djibouti port partnership to reduce clearance time.",
            "source": "operations"
        }
    
    # Example: Client retention + marketing
    retention = get_metric("customer_retention")
    at_risk_clients = get_at_risk_clients()
    
    if retention < 89 and len(at_risk_clients) > 2:
        return {
            "title": "Client Retention Opportunity",
            "message": f"{len(at_risk_clients)} enterprise clients show declining shipment volume.",
            "confidence": 0.87,
            "severity": "medium",
            "recommendation": "Assign Account Managers for proactive check-ins.",
            "source": "clients"
        }
    
    return None