def optimize_channel_budget():
    channels = get_channel_performance()
    email_roi = channels['email']['roi']
    social_roi = channels['social']['roi']
    
    if email_roi > social_roi * 3:
        return {
            "title": "ROI Optimization Opportunity",
            "message": f"Email campaigns deliver {email_roi/social_roi:.1f}x higher ROI than social media.",
            "confidence": 0.93,
            "severity": "medium",
            "recommendation": "Reallocate 50% of TikTok budget to email segmentation."
        }
    return None

def analyze_lead_quality():
    social_conv = get_conversion_rate('social')
    email_conv = get_conversion_rate('email')
    ratio = email_conv / social_conv
    
    if ratio > 1.5:
        return {
            "title": "Lead Quality Alert",
            "message": f"Social media leads have {100*(1-1/ratio):.0f}% lower conversion rate vs email.",
            "confidence": 0.89,
            "severity": "medium",
            "recommendation": "Add lead scoring to prioritize high-intent channels."
        }
    return None