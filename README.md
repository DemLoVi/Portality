# My variant of "Window to Virtuality"

Yep, it works. Yep, it works badly. But hey — it works! 🚀

## Installation

You’ll need **Python 3.10 or 3.11** (other versions may not support the `mediapipe` library).

1. Install Python dependencies:

    ```bash
    pip install -r requirements.txt
    ```

2. Install Node.js dependencies:

    ```bash
    npm install three
    ```

## Configuration and Running

First, calibrate your camera.

In both `main.py` and `calibrate.py`, set the real distance between corners of your your eyes (in meters):

```python
REAL_EYE_DIST = 0.115
```

In calibrate.py, you can also set the distance from you to the camera.
⚠️ During calibration you must sit exactly at this distance:

```python
DISTANCE_TO_CAMERA = 0.78
```

Run calibration:

python calibrate.py

It will show your camera feed and calculate a coefficient.
Copy this value into main.py:

```python
COEF = 1.1
```

Next, open index.js and set the real dimensions of your monitor (in meters).
Depth is used only for drawing the virtual room:

```js
const monitorWidth = 0.52
const monitorHeight = 0.294
const monitorDepth = 0.4
```

Running

Start the local website:

```bash
npm run dev
```

Then run the Python script:

```bash
python main.py
```

After a few seconds the Python script will start working — just reload the page.

## Usage

You can change render mode between default and anaglyph by press Alt+1 and Alt+2, now this is a beta feature so it's may work unstable and not corectly

🎉 Enjoy your “window to virtuality”!
