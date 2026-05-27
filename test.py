import json 

data = {
    "labels": ["100", "10k", "1M", "10M"],
    "series": [
        {"name": "Pydantic V2", "data": [0.04, 4.10, 410.5, 4105.2]},
        {"name": "POPO", "data": [0.01, 1.52, 152.6, 1525.8]},
        {"name": "Dataclass", "data": [0.01, 1.58, 158.2, 1582.1]},
        {"name": "Slotted POPO", "data": [0.01, 0.61, 61.0, 610.3]}
    ]
}

# Sort the series list in place based on the last value in 'data'
data["series"].sort(key=lambda x: x["data"][-1], reverse=True)

with open("test.json", "+w") as f:
    json.dump(data, f)
