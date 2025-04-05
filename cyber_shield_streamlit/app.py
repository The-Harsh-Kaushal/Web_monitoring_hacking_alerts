from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained model and scaler
model = joblib.load('cyber_shield_model.pkl')
scaler = joblib.load('scaler.pkl')

# Load label encoders if saved (optional)
try:
    label_encoders = joblib.load('label_encoders.pkl')
except FileNotFoundError:
    label_encoders = {}

# Define the expected 118 features (replace with your exact feature list)
expected_features = [
    'requests_per_hour', 'session_duration', 'geolocation', 'packet_length',
    'flow_duration', 'protocol', 'src_port', 'dst_port', 'packet_count',
    'byte_count',  # Add the remaining 108 features here
    # Example placeholders (customize based on your training data)
    'flow_bytes_s', 'flow_packets_s', 'flow_iat_mean', 'flow_iat_std',
    # ... (rest of the features as in the previous code)
]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data or not all(feature in data for feature in expected_features):
            return jsonify({'error': 'Missing required features. Provide all 118 features.'}), 400

        input_df = pd.DataFrame([data])

        # Encode categorical variables
        for col in input_df.select_dtypes(include=['object']).columns:
            if col in label_encoders:
                input_df[col] = label_encoders[col].transform(input_df[col].astype(str))
            else:
                input_df[col] = input_df[col].astype('category').cat.codes

        # Scale numerical features
        numeric_cols = input_df.select_dtypes(include=[np.number]).columns
        input_df[numeric_cols] = scaler.transform(input_df[numeric_cols])

        # Ensure column order matches training
        input_df = input_df[expected_features]

        # Make prediction
        prediction = model.predict(input_df)
        result = {
            'is_attack': int(prediction[0]),
            'message': '1 = Attack Detected, 0 = Normal Activity'
        }

        if hasattr(model, 'predict_proba'):
            probability = model.predict_proba(input_df)[0][1]
            result['probability'] = float(probability)

        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)