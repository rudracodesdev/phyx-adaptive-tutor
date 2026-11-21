import os
import platform
import subprocess
import tempfile
from typing import Dict, Any


def transcribe_wav_bytes(wav_bytes: bytes) -> Dict[str, Any]:
    """
    Transcribes 16kHz mono PCM WAV audio locally via Windows System.Speech
    (100% offline, zero API keys).
    """
    if not wav_bytes or len(wav_bytes) < 200:
        return {"success": False, "transcript": "", "error": "No audio captured. Please speak closer to your mic."}

    if platform.system() != "Windows":
        return {
            "success": False,
            "transcript": "",
            "error": "Offline Windows speech engine unavailable on this OS; open http://127.0.0.1:8000 in Chrome/Edge.",
        }

    tmp_wav = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as f:
            f.write(wav_bytes)
            tmp_wav = f.name

        escaped_path = tmp_wav.replace("'", "''")
        ps_script = f"""
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$recognizers = [System.Speech.Recognition.SpeechRecognitionEngine]::InstalledRecognizers()
if ($recognizers.Count -eq 0) {{
    Write-Output ""
    exit 0
}}
$engine = New-Object System.Speech.Recognition.SpeechRecognitionEngine($recognizers[0])
$engine.BabbleTimeout = [TimeSpan]::FromSeconds(2)
$engine.InitialSilenceTimeout = [TimeSpan]::FromSeconds(3)
$engine.EndSilenceTimeout = [TimeSpan]::FromSeconds(0.8)
$engine.SetInputToWaveFile('{escaped_path}')

$phrases = New-Object System.Speech.Recognition.Choices
$phrases.Add(@(
    "Open live class", "Open lecture", "Open visualizer", "Open concept graph",
    "Show teacher dashboard", "How does it work", "Login", "Sign up",
    "Simulate 24 hours", "Reset progress", "What is my weakest topic",
    "What is my progress", "Explain mirror sign convention", "Explain lens formula",
    "Explain Ohm's law", "Explain Snell's law", "Explain Fleming's left hand rule",
    "Explain series and parallel circuits", "Explain Joule heating and electric power",
    "Object distance is negative", "Concave mirror focal length is negative",
    "Convex mirror focal length is positive", "Light bends towards the normal",
    "Resistance is constant", "Parallel resistors add as reciprocals",
    "Why does this work", "Give a solved numerical", "Common exam trap"
))
$gb = New-Object System.Speech.Recognition.GrammarBuilder($phrases)
$gb.Culture = $recognizers[0].Culture
$cmdGrammar = New-Object System.Speech.Recognition.Grammar($gb)
$cmdGrammar.Weight = 0.55

$dictGrammar = New-Object System.Speech.Recognition.DictationGrammar
$dictGrammar.Weight = 0.45

$engine.LoadGrammar($cmdGrammar)
$engine.LoadGrammar($dictGrammar)

$parts = @()
while ($true) {{
    $res = $engine.Recognize()
    if ($null -eq $res) {{ break }}
    if ($res.Text) {{ $parts += $res.Text }}
}}
$engine.Dispose()
Write-Output ($parts -join " ")
"""
        proc = subprocess.run(
            ["powershell", "-NoProfile", "-NonInteractive", "-Command", ps_script],
            capture_output=True,
            text=True,
            timeout=12,
        )
        transcript = (proc.stdout or "").strip()
        return {
            "success": bool(transcript),
            "transcript": transcript,
            "error": None if transcript else "Could not recognize clear words—try speaking slightly louder.",
        }
    except subprocess.TimeoutExpired:
        return {"success": False, "transcript": "", "error": "Voice transcription timed out."}
    except Exception as exc:
        return {"success": False, "transcript": "", "error": str(exc)}
    finally:
        if tmp_wav and os.path.exists(tmp_wav):
            try:
                os.remove(tmp_wav)
            except OSError:
                pass
