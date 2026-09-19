#!/usr/bin/env python3
"""
ResourceMatch AI - Python & Pandas-Style Analytics & Chart Generation Engine
Executes statistical aggregation, trend analysis, and SVG visual charts.
"""

import sys
import json
import math
from datetime import datetime
from collections import defaultdict

def create_bar_chart_svg(title, labels, values, color="#3B82F6", width=500, height=260):
    """Generates a clean, modern Matplotlib-styled SVG bar chart."""
    if not values or max(values) == 0:
        max_val = 10
    else:
        max_val = max(values) * 1.15

    margin_left = 60
    margin_bottom = 50
    margin_top = 40
    margin_right = 30
    plot_width = width - margin_left - margin_right
    plot_height = height - margin_top - margin_bottom

    bar_count = len(labels)
    bar_width = min(40, (plot_width / max(1, bar_count)) * 0.65)
    gap = plot_width / max(1, bar_count)

    svg_lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" class="w-full h-auto font-sans">',
        f'<rect width="{width}" height="{height}" fill="#FAFAF9" rx="8"/>',
        f'<text x="{margin_left}" y="{margin_top - 14}" font-size="13" font-weight="600" fill="#1C1917">{title}</text>',
    ]

    # Gridlines & Y-axis labels
    for i in range(5):
        y_val = int(max_val * (i / 4))
        y_pos = margin_top + plot_height - (plot_height * (i / 4))
        svg_lines.append(f'<line x1="{margin_left}" y1="{y_pos}" x2="{width - margin_right}" y2="{y_pos}" stroke="#E7E5E4" stroke-width="1" stroke-dasharray="3,3"/>')
        svg_lines.append(f'<text x="{margin_left - 8}" y="{y_pos + 4}" font-size="10" fill="#78716C" text-anchor="end">{y_val}</text>')

    # Bars & X-axis labels
    for idx, (label, val) in enumerate(zip(labels, values)):
        bar_h = (val / max_val) * plot_height if max_val > 0 else 0
        x_pos = margin_left + idx * gap + (gap - bar_width) / 2
        y_pos = margin_top + plot_height - bar_h

        # Bar rect
        svg_lines.append(f'<rect x="{x_pos}" y="{y_pos}" width="{bar_width}" height="{bar_h}" fill="{color}" rx="3"/>')
        # Value label on top
        if bar_h > 15:
            svg_lines.append(f'<text x="{x_pos + bar_width/2}" y="{y_pos - 4}" font-size="10" font-weight="600" fill="#1C1917" text-anchor="middle">{val}</text>')
        # X label
        short_label = label[:11] + (".." if len(label) > 11 else "")
        svg_lines.append(f'<text x="{x_pos + bar_width/2}" y="{margin_top + plot_height + 16}" font-size="10" fill="#57534E" text-anchor="middle">{short_label}</text>')

    # Axes lines
    svg_lines.append(f'<line x1="{margin_left}" y1="{margin_top + plot_height}" x2="{width - margin_right}" y2="{margin_top + plot_height}" stroke="#A8A29E" stroke-width="1.5"/>')
    svg_lines.append(f'<line x1="{margin_left}" y1="{margin_top}" x2="{margin_left}" y2="{margin_top + plot_height}" stroke="#A8A29E" stroke-width="1.5"/>')
    svg_lines.append('</svg>')
    return "".join(svg_lines)

def create_line_chart_svg(title, x_labels, series_data, colors=None, width=500, height=260):
    """Generates a Matplotlib-styled multi-series or single-series line chart SVG."""
    if colors is None:
        colors = ["#2563EB", "#059669"]

    all_vals = []
    for s in series_data:
        all_vals.extend(s["values"])
    max_val = max(all_vals) * 1.2 if all_vals and max(all_vals) > 0 else 10

    margin_left = 55
    margin_bottom = 45
    margin_top = 40
    margin_right = 30
    plot_width = width - margin_left - margin_right
    plot_height = height - margin_top - margin_bottom

    svg_lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" class="w-full h-auto font-sans">',
        f'<rect width="{width}" height="{height}" fill="#FAFAF9" rx="8"/>',
        f'<text x="{margin_left}" y="{margin_top - 14}" font-size="13" font-weight="600" fill="#1C1917">{title}</text>',
    ]

    # Gridlines
    for i in range(5):
        y_val = int(max_val * (i / 4))
        y_pos = margin_top + plot_height - (plot_height * (i / 4))
        svg_lines.append(f'<line x1="{margin_left}" y1="{y_pos}" x2="{width - margin_right}" y2="{y_pos}" stroke="#E7E5E4" stroke-width="1" stroke-dasharray="3,3"/>')
        svg_lines.append(f'<text x="{margin_left - 8}" y="{y_pos + 4}" font-size="10" fill="#78716C" text-anchor="end">{y_val}</text>')

    count = len(x_labels)
    gap = plot_width / max(1, count - 1) if count > 1 else plot_width / 2

    # Draw lines & points for each series
    for s_idx, s in enumerate(series_data):
        c = colors[s_idx % len(colors)]
        points = []
        for i, val in enumerate(s["values"]):
            px = margin_left + (i * gap if count > 1 else plot_width / 2)
            py = margin_top + plot_height - ((val / max_val) * plot_height)
            points.append((px, py, val))

        path_d = " ".join([f"{'M' if idx == 0 else 'L'} {px:.1f} {py:.1f}" for idx, (px, py, _) in enumerate(points)])
        svg_lines.append(f'<path d="{path_d}" fill="none" stroke="{c}" stroke-width="2.5" stroke-linecap="round"/>')

        for px, py, val in points:
            svg_lines.append(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="4" fill="{c}" stroke="#FFFFFF" stroke-width="1.5"/>')

    # X axis labels
    for i, label in enumerate(x_labels):
        px = margin_left + (i * gap if count > 1 else plot_width / 2)
        svg_lines.append(f'<text x="{px}" y="{margin_top + plot_height + 16}" font-size="10" fill="#57534E" text-anchor="middle">{label}</text>')

    svg_lines.append('</svg>')
    return "".join(svg_lines)

def run_analytics(payload):
    """Executes Pandas-like aggregations on resources, requests, and transfers."""
    resources = payload.get("resources", [])
    requests = payload.get("requests", [])
    transfers = payload.get("transfers", [])
    organizations = payload.get("organizations", [])

    # 1. Resource Statistics
    total_resources_count = len(resources)
    total_units = sum(r.get("quantity", 0) for r in resources)
    available_units = sum(r.get("quantity", 0) for r in resources if r.get("status") == "AVAILABLE")
    transferred_units = sum(r.get("quantity", 0) for r in resources if r.get("status") == "TRANSFERRED")
    matched_units = sum(r.get("quantity", 0) for r in resources if r.get("status") == "MATCHED")

    # 2. Category Analysis (Pandas df.groupby('category')['quantity'].sum())
    cat_counts = defaultdict(int)
    cat_demands = defaultdict(int)
    for r in resources:
        cat_counts[r.get("category", "Other")] += r.get("quantity", 0)
    for req in requests:
        cat_demands[req.get("category", "Other")] += req.get("quantity", 0)

    category_labels = sorted(list(set(list(cat_counts.keys()) + list(cat_demands.keys()))))
    category_supply = [cat_counts[c] for c in category_labels]
    category_demand = [cat_demands[c] for c in category_labels]

    # 3. Monthly Transfer Trends
    trend_counts = defaultdict(int)
    trend_units = defaultdict(int)
    for t in transfers:
        date_str = t.get("transfer_date", "")[:7] or "2026-08"
        trend_counts[date_str] += 1
        trend_units[date_str] += t.get("quantity", 0)

    # Ensure last months
    trend_months = sorted(list(trend_counts.keys()))
    if not trend_months:
        trend_months = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09"]
        for m in trend_months:
            trend_units[m] = 0

    monthly_units = [trend_units[m] for m in trend_months]

    # 4. Success Rate Calculation
    total_requests = len(requests)
    fulfilled_requests = len([req for req in requests if req.get("status") == "FULFILLED"])
    pending_requests = len([req for req in requests if req.get("status") == "PENDING"])
    success_rate = round((fulfilled_requests / max(1, total_requests)) * 100, 1)

    # 5. Organization Activity
    org_stats = defaultdict(lambda: {"resources_donated": 0, "requests_placed": 0, "units_donated": 0})
    for r in resources:
        org_id = r.get("organization_id", 0)
        org_stats[org_id]["resources_donated"] += 1
        org_stats[org_id]["units_donated"] += r.get("quantity", 0)
    for req in requests:
        org_id = req.get("organization_id", 0)
        org_stats[org_id]["requests_placed"] += 1

    org_lookup = {o["id"]: o["name"] for o in organizations}
    org_activity_list = []
    for org_id, stats in org_stats.items():
        name = org_lookup.get(org_id, f"Organization #{org_id}")
        org_activity_list.append({
            "organizationId": org_id,
            "organizationName": name,
            "resourcesDonated": stats["resources_donated"],
            "unitsDonated": stats["units_donated"],
            "requestsPlaced": stats["requests_placed"]
        })
    org_activity_list.sort(key=lambda x: x["unitsDonated"], reverse=True)

    # Generate Matplotlib-styled SVG vector charts
    category_chart_svg = create_bar_chart_svg("Resource Inventory by Category (Units)", category_labels, category_supply, color="#2563EB")
    trends_chart_svg = create_line_chart_svg("Monthly Distribution Trends (Units)", trend_months, [{"name": "Units Transferred", "values": monthly_units}], colors=["#059669"])

    return {
        "resourceStatistics": {
            "totalResourcesCount": total_resources_count,
            "totalUnits": total_units,
            "availableUnits": available_units,
            "transferredUnits": transferred_units,
            "matchedUnits": matched_units
        },
        "successRate": {
            "ratePercent": success_rate,
            "totalRequests": total_requests,
            "fulfilledRequests": fulfilled_requests,
            "pendingRequests": pending_requests
        },
        "categoryAnalysis": {
            "categories": category_labels,
            "supply": category_supply,
            "demand": category_demand,
            "mostRequestedCategory": max(cat_demands.items(), key=lambda x: x[1])[0] if cat_demands else "None"
        },
        "transferTrends": {
            "months": trend_months,
            "monthlyUnits": monthly_units,
            "totalTransfersCount": len(transfers)
        },
        "organizationActivity": org_activity_list,
        "charts": {
            "categoryChartSvg": category_chart_svg,
            "trendsChartSvg": trends_chart_svg
        }
    }

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--demo":
        payload = {
            "resources": [
                {"category": "Furniture", "quantity": 50, "status": "AVAILABLE", "organization_id": 4},
                {"category": "Educational Supplies", "quantity": 100, "status": "AVAILABLE", "organization_id": 3},
                {"category": "Technology & Electronics", "quantity": 25, "status": "AVAILABLE", "organization_id": 4},
                {"category": "Educational Supplies", "quantity": 40, "status": "AVAILABLE", "organization_id": 6},
                {"category": "Furniture", "quantity": 30, "status": "AVAILABLE", "organization_id": 1},
                {"category": "Books & Media", "quantity": 200, "status": "AVAILABLE", "organization_id": 5},
                {"category": "Technology & Electronics", "quantity": 15, "status": "TRANSFERRED", "organization_id": 4},
                {"category": "Furniture", "quantity": 60, "status": "TRANSFERRED", "organization_id": 3}
            ],
            "requests": [
                {"category": "Furniture", "quantity": 40, "status": "PENDING", "organization_id": 1},
                {"category": "Educational Supplies", "quantity": 80, "status": "PENDING", "organization_id": 2},
                {"category": "Technology & Electronics", "quantity": 20, "status": "PENDING", "organization_id": 5},
                {"category": "Educational Supplies", "quantity": 35, "status": "PENDING", "organization_id": 2},
                {"category": "Furniture", "quantity": 15, "status": "PENDING", "organization_id": 6},
                {"category": "Books & Media", "quantity": 150, "status": "PENDING", "organization_id": 5},
                {"category": "Technology & Electronics", "quantity": 15, "status": "FULFILLED", "organization_id": 3},
                {"category": "Furniture", "quantity": 60, "status": "FULFILLED", "organization_id": 2}
            ],
            "transfers": [
                {"quantity": 15, "status": "COMPLETED", "transfer_date": "2026-08-12 14:30:00"},
                {"quantity": 60, "status": "COMPLETED", "transfer_date": "2026-08-08 11:00:00"}
            ],
            "organizations": [
                {"id": 1, "name": "City Youth Community Center"},
                {"id": 2, "name": "Sunrise Public Elementary School"},
                {"id": 3, "name": "Hope Harvest Relief Network"},
                {"id": 4, "name": "Green Future Tech Recyclers"},
                {"id": 5, "name": "Oak Valley Literacy Project"},
                {"id": 6, "name": "St. Jude Family Shelter"}
            ]
        }
        res = run_analytics(payload)
        print(json.dumps(res, indent=2))
        return

    try:
        input_data = sys.stdin.read()
        if input_data.strip():
            payload = json.loads(input_data)
        else:
            payload = {}
        res = run_analytics(payload)
        print(json.dumps(res))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
