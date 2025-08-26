import asyncio
import websockets
import json
import cv2
import mediapipe as mp
from threading import Thread

REAL_EYE_DIST = 0.11
FOCAL_LENGTH = 0.9
frame_data = {"x": 0, "y": 0, "z": 0}

def capture_loop():
    global frame_data
    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)
    cap = cv2.VideoCapture(0)
    #cv2.imshow("Cap", cap)

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        frame_height, frame_width, _ = frame.shape
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb)

        if results.multi_face_landmarks:
            face_landmarks = results.multi_face_landmarks[0]
            left_eye = face_landmarks.landmark[33]
            right_eye = face_landmarks.landmark[263]

            cx = (left_eye.x + right_eye.x) / 2
            cy = (left_eye.y + right_eye.y) / 2
            eye_dist_norm = abs(left_eye.x - right_eye.x)

            if eye_dist_norm > 0:
                distance_to_camera = REAL_EYE_DIST * FOCAL_LENGTH / eye_dist_norm
            else:
                distance_to_camera = 0.5

            norm_x = cx - 0.5
            norm_y = cy - 0.5

            real_x = norm_x * distance_to_camera
            real_y = norm_y * distance_to_camera
            real_z = distance_to_camera

            frame_data = {"x": real_x, "y": real_y, "z": real_z}

# Асинхронная отправка данных
async def send_coordinates(websocket):
    global frame_data
    try:
        while True:
            await websocket.send(json.dumps(frame_data))
            await asyncio.sleep(0.01)
    except websockets.ConnectionClosed:
        print("Client disconnected")

# Запуск видеопотока в отдельном потоке
Thread(target=capture_loop, daemon=True).start()

# Запуск сервера
async def main():
    async with websockets.serve(send_coordinates, "127.0.0.1", 8765):
        print("WebSocket server running on ws://127.0.0.1:8765")
        await asyncio.Future()  # держим сервер живым

asyncio.run(main())
