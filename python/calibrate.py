import cv2
import mediapipe as mp

REAL_EYE_DIST = 0.115
DISTANCE_TO_CAMERA = 0.78

global frame_data
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)
cap = cv2.VideoCapture(0)

succes, frame = cap.read()

frame_height, frame_width, _ = frame.shape
rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
results = face_mesh.process(rgb)

if results.multi_face_landmarks:
    for face_landmarks in results.multi_face_landmarks:
        # Координаты глаз
        left_eye = face_landmarks.landmark[33]   # правый глаз с точки зрения камеры
        right_eye = face_landmarks.landmark[263] # левый глаз
        # Середина между глазами
        cx = (left_eye.x + right_eye.x) / 2
        cy = (left_eye.y + right_eye.y) / 2
        # Нормированная ширина глаз
        eye_dist_norm = abs(left_eye.x - right_eye.x)

        norm_x = cx - 0.5
        norm_y = cy - 0.5

        coef = DISTANCE_TO_CAMERA * eye_dist_norm / REAL_EYE_DIST

        cv2.putText(frame, f"Norm: x={norm_x:.3f} y={norm_y:.3f}", 
                    (30, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,0), 2)
        cv2.putText(frame, f"Coef: {coef}",
                    (30, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,255), 2)


        # Рисуем глаза
        lx, ly = int(left_eye.x * frame_width), int(left_eye.y * frame_height)
        rx, ry = int(right_eye.x * frame_width), int(right_eye.y * frame_height)
        cv2.circle(frame, (lx, ly), 3, (255,0,0), -1)
        cv2.circle(frame, (rx, ry), 3, (255,0,0), -1)


cv2.imshow("Face tracking", frame)

while True:
    if cv2.waitKey(1) & 0xFF == ord('q'): break