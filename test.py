import cv2
import mediapipe as mp
import numpy as np
import math
import time

# ---------------- INIT ----------------
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7)
mp_draw = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)
cap.set(3, 1280)
cap.set(4, 720)

canvas = np.ones((720, 1280, 3), dtype=np.uint8) * 255

color = (0, 0, 255)

# ---------------- STATES ----------------
brush_type = "PEN"
brush_thickness = 5
min_size, max_size = 2, 15

prev_x, prev_y = 0, 0
mode = "DRAW"
start_x, start_y = 0, 0

show_colors = False
show_shapes = False
show_brush = False
eraser_mode = False
fill_mode = False

# ---------------- COLORS ----------------
colors = [
    (0,0,255),(0,255,0),(255,0,0),
    (0,255,255),(255,0,255),(255,255,0),
    (0,0,0),(128,0,128),(255,165,0),(128,128,128)
]

# ---------------- SHAPES ----------------
shapes = ["DRAW","LINE","RECT","CIRCLE","ELLIPSE"]

# ---------------- BUTTONS ----------------
color_btn = (20,20,120,60)
shape_btn = (140,20,240,60)
brush_btn = (260,20,360,60)
fill_btn  = (380,20,480,60)

eraser_btn = (1100,50,1240,100)
clear_btn  = (1100,120,1240,170)

# ---------------- LOOP ----------------
while True:
    success, frame = cap.read()
    frame = cv2.flip(frame, 1)

    # -------- UI --------
    cv2.rectangle(frame,(20,20),(120,60),(200,200,200),-1)
    cv2.putText(frame,"Colors",(30,50),cv2.FONT_HERSHEY_SIMPLEX,0.6,(0,0,0),2)

    cv2.rectangle(frame,(140,20),(240,60),(200,200,200),-1)
    cv2.putText(frame,"Shapes",(150,50),cv2.FONT_HERSHEY_SIMPLEX,0.6,(0,0,0),2)

    cv2.rectangle(frame,(260,20),(360,60),(200,200,200),-1)
    cv2.putText(frame,"Brush",(270,50),cv2.FONT_HERSHEY_SIMPLEX,0.6,(0,0,0),2)

    cv2.rectangle(frame,(380,20),(480,60),(200,200,200),-1)
    cv2.putText(frame,"Fill",(400,50),cv2.FONT_HERSHEY_SIMPLEX,0.6,(0,0,0),2)

    if fill_mode:
        cv2.rectangle(frame,(380,20),(480,60),(0,255,0),2)

    cv2.rectangle(frame,(1100,50),(1240,100),(180,180,180),-1)
    cv2.putText(frame,"Eraser",(1110,85),cv2.FONT_HERSHEY_SIMPLEX,0.6,(0,0,0),2)

    if eraser_mode:
        cv2.rectangle(frame,(1100,50),(1240,100),(0,255,0),2)

    cv2.rectangle(frame,(1100,120),(1240,170),(180,180,180),-1)
    cv2.putText(frame,"Clear",(1120,155),cv2.FONT_HERSHEY_SIMPLEX,0.6,(0,0,0),2)

    # -------- PANELS --------
    if show_colors:
        for i, col in enumerate(colors):
            x1,y1 = 20,80+i*45
            cv2.rectangle(frame,(x1,y1),(x1+40,y1+40),col,-1)
            if col == color:
                cv2.rectangle(frame,(x1,y1),(x1+40,y1+40),(255,255,255),2)

    if show_shapes:
        for i, s in enumerate(shapes):
            x1,y1 = 140,80+i*50
            cv2.rectangle(frame,(x1,y1),(x1+100,y1+40),(180,180,180),-1)
            cv2.putText(frame,s,(150,y1+25),cv2.FONT_HERSHEY_SIMPLEX,0.5,(0,0,0),2)
            if mode == s:
                cv2.rectangle(frame,(x1,y1),(x1+100,y1+40),(0,255,0),2)

    if show_brush:
        for i, b in enumerate(["PEN","MARKER","SPRAY"]):
            x1,y1 = 260,80+i*50
            cv2.rectangle(frame,(x1,y1),(x1+100,y1+40),(180,180,180),-1)
            cv2.putText(frame,b,(270,y1+25),cv2.FONT_HERSHEY_SIMPLEX,0.5,(0,0,0),2)
            if brush_type == b:
                cv2.rectangle(frame,(x1,y1),(x1+100,y1+40),(0,255,0),2)

        # + -
        cv2.rectangle(frame,(260,240),(310,280),(200,200,200),-1)
        cv2.putText(frame,"+",(275,270),cv2.FONT_HERSHEY_SIMPLEX,1,(0,0,0),2)

        cv2.rectangle(frame,(310,240),(360,280),(200,200,200),-1)
        cv2.putText(frame,"-",(325,270),cv2.FONT_HERSHEY_SIMPLEX,1,(0,0,0),2)

        cv2.putText(frame,f"Size:{brush_thickness}",(260,320),
                    cv2.FONT_HERSHEY_SIMPLEX,0.5,(0,0,0),2)

    # -------- HAND TRACKING --------
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    if result.multi_hand_landmarks:
        for hand_landmarks in result.multi_hand_landmarks:

            lm = hand_landmarks.landmark
            h,w,_ = frame.shape
            x,y = int(lm[8].x*w), int(lm[8].y*h)

            index_up = lm[8].y < lm[6].y
            middle_up = lm[12].y < lm[10].y

            index_down = lm[8].y > lm[6].y
            middle_down = lm[12].y > lm[10].y
            ring_down = lm[16].y > lm[14].y
            pinky_down = lm[20].y > lm[18].y
            fist = index_down and middle_down and ring_down and pinky_down

            # -------- CLICK --------
            if index_up and middle_up:
                prev_x, prev_y = 0, 0

                if 20<x<120 and 20<y<60:
                    show_colors = not show_colors
                    show_shapes = show_brush = False

                elif 140<x<240 and 20<y<60:
                    show_shapes = not show_shapes
                    show_colors = show_brush = False

                elif 260<x<360 and 20<y<60:
                    show_brush = not show_brush
                    show_colors = show_shapes = False

                elif 380<x<480 and 20<y<60:
                    fill_mode = not fill_mode

                elif 1100<x<1240 and 50<y<100:
                    eraser_mode = not eraser_mode

                elif 1100<x<1240 and 120<y<170:
                    canvas[:] = 255

                # selections
                if show_colors:
                    for i, col in enumerate(colors):
                        x1,y1 = 20,80+i*45
                        if x1<x<x1+40 and y1<y<y1+40:
                            color = col
                            eraser_mode = False

                if show_shapes:
                    for i, s in enumerate(shapes):
                        x1,y1 = 140,80+i*50
                        if x1<x<x1+100 and y1<y<y1+40:
                            mode = s
                            start_x,start_y = 0,0

                if show_brush:
                    for i, b in enumerate(["PEN","MARKER","SPRAY"]):
                        x1,y1 = 260,80+i*50
                        if x1<x<x1+100 and y1<y<y1+40:
                            brush_type = b

                    if 260<x<310 and 240<y<280:
                        brush_thickness = min(max_size, brush_thickness+1)

                    if 310<x<360 and 240<y<280:
                        brush_thickness = max(min_size, brush_thickness-1)

            # -------- FILL --------
            elif fill_mode and index_up and not middle_up:
                mask = np.zeros((canvas.shape[0]+2, canvas.shape[1]+2), np.uint8)
                cv2.floodFill(canvas, mask, (x,y), color)
                fill_mode = False

            # -------- DRAW / SHAPES --------
            elif index_up and not middle_up:

                draw_color = (255,255,255) if eraser_mode else color
                thickness = brush_thickness + (5 if brush_type=="MARKER" else 0)

                if mode == "DRAW":
                    if prev_x == 0:
                        prev_x, prev_y = x,y

                    if brush_type in ["PEN","MARKER"]:
                        cv2.line(canvas,(prev_x,prev_y),(x,y),draw_color,thickness)

                    elif brush_type == "SPRAY":
                        for _ in range(15):
                            rx = x + np.random.randint(-10,10)
                            ry = y + np.random.randint(-10,10)
                            cv2.circle(canvas,(rx,ry),1,draw_color,-1)

                    prev_x, prev_y = x,y

                else:
                    if start_x == 0:
                        start_x,start_y = x,y

                    temp = canvas.copy()

                    if mode == "LINE":
                        cv2.line(temp,(start_x,start_y),(x,y),draw_color,thickness)
                    elif mode == "RECT":
                        cv2.rectangle(temp,(start_x,start_y),(x,y),draw_color,thickness)
                    elif mode == "CIRCLE":
                        r = int(math.hypot(x-start_x,y-start_y))
                        cv2.circle(temp,(start_x,start_y),r,draw_color,thickness)
                    elif mode == "ELLIPSE":
                        axes = (abs(x-start_x),abs(y-start_y))
                        cv2.ellipse(temp,(start_x,start_y),axes,0,0,360,draw_color,thickness)

                    frame = cv2.addWeighted(frame,0.5,temp,0.5,0)

            # -------- FINALIZE SHAPE --------
            if fist and start_x != 0:
                draw_color = (255,255,255) if eraser_mode else color
                thickness = brush_thickness + (5 if brush_type=="MARKER" else 0)

                if mode == "LINE":
                    cv2.line(canvas,(start_x,start_y),(x,y),draw_color,thickness)
                elif mode == "RECT":
                    cv2.rectangle(canvas,(start_x,start_y),(x,y),draw_color,thickness)
                elif mode == "CIRCLE":
                    r = int(math.hypot(x-start_x,y-start_y))
                    cv2.circle(canvas,(start_x,start_y),r,draw_color,thickness)
                elif mode == "ELLIPSE":
                    axes = (abs(x-start_x),abs(y-start_y))
                    cv2.ellipse(canvas,(start_x,start_y),axes,0,0,360,draw_color,thickness)

                start_x,start_y = 0,0
                prev_x, prev_y = 0,0

            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

    frame = cv2.addWeighted(frame,0.5,canvas,0.5,0)

    # -------- SAVE --------
    key = cv2.waitKey(1) & 0xFF
    if key == 27:
        break
    elif key == ord('s'):
        filename = f"air_canvas_{int(time.time())}.png"
        cv2.imwrite(filename, canvas)
        print("Saved:", filename)

    cv2.imshow("Air Canvas", frame)

cap.release()
cv2.destroyAllWindows()