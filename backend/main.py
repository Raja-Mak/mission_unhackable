import base64
import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

# Load environment variables explicitly from backend/.env
load_dotenv(Path(__file__).parent / ".env")

app = FastAPI(title="Mission Unhackable API")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class URLRequest(BaseModel):
  url: str


def process_vt_scan(target_url: str):
  # Fetch the API key dynamically on every request
  vt_api_key = os.getenv("VIRUSTOTAL_API_KEY")

  if not vt_api_key:
    raise HTTPException(
        status_code=500, detail="VirusTotal API key is missing from environment."
    )

  headers = {"x-apikey": vt_api_key}

  # VirusTotal v3 requires base64url encoding without trailing padding '='
  url_id = base64.urlsafe_b64encode(target_url.encode()).decode().strip("=")
  vt_url = f"https://www.virustotal.com/api/v3/urls/{url_id}"

  response = requests.get(vt_url, headers=headers)

  if response.status_code == 404:
    submit_response = requests.post(
        "https://www.virustotal.com/api/v3/urls",
        headers=headers,
        data={"url": target_url},
    )
    if submit_response.status_code not in [200, 201]:
      raise HTTPException(
          status_code=500, detail="Failed to submit URL to VirusTotal."
      )
    return {
        "status": "queued",
        "message": (
            "URL not found in cache. Submitted for scanning. Try again in a"
            " few seconds."
        ),
    }
  elif response.status_code == 200:
    result = response.json()
    stats = (
        result.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
    )
    return {"status": "success", "stats": stats}
  else:
    raise HTTPException(
        status_code=500, detail="Error communicating with VirusTotal API."
    )


@app.get("/")
def home():
  return {"message": "Mission Unhackable Backend is Live!"}


@app.post("/api/scan")
def scan_url(data: URLRequest):
  return process_vt_scan(data.url)


@app.post("/check-url")
def check_url(data: URLRequest):
  return process_vt_scan(data.url)