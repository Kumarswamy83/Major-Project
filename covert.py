import pandas as pd
import json

# Load your CSV
df = pd.read_csv("forecast_dashboard_data_with_names.csv")

# Build display_label exactly like Streamlit does
df["display_label"] = df["product_name"] + " (" + df["sku_id"] + ")"

# Rename columns to match what page.js expects
records = []
for _, row in df.iterrows():
    records.append({
        "sku_id":        row["sku_id"],
        "display_label": row["display_label"],
        "name":          row["inventory_name"],

        # 7-day fields
        "xgb":   int(row["xgb_7_day"]),
        "lstm":  int(row["lstm_7_day"]),
        "final": int(row["final_7_day_units"]),

        # 14-day fields
        "xgb_14":   int(row["xgb_14_day"]),
        "lstm_14":  int(row["lstm_14_day"]),
        "final_14": int(row["final_14_day_units"]),
    })

# Save to public/data.json (place this script next to your CSV,
# then copy the output into your Next.js public/ folder)
with open("data.json", "w") as f:
    json.dump(records, f, indent=2)

# Print totals to verify they match Streamlit
total_7  = df["final_7_day_units"].sum()
total_14 = df["final_14_day_units"].sum()
print(f"✅ data.json generated with {len(records)} products")
print(f"   Total 7-day  units : {total_7:,}")
print(f"   Total 14-day units : {total_14:,}")