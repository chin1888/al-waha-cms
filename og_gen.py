from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
img = Image.new("RGB", (W, H), (10, 14, 28))
draw = ImageDraw.Draw(img)

# Vertical gradient (dark navy -> near black)
top = (16, 24, 48)
bot = (8, 10, 20)
for y in range(H):
    r = int(top[0] + (bot[0] - top[0]) * y / H)
    g = int(top[1] + (bot[1] - top[1]) * y / H)
    b = int(top[2] + (bot[2] - top[2]) * y / H)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# Gold accent line
draw.rectangle([(W // 2 - 120, 250), (W // 2 + 120, 254)], fill=(212, 175, 55))

font_dir = "C:/Windows/Fonts"
title_font = ImageFont.truetype(os.path.join(font_dir, "arialbd.ttf"), 120)
sub_font = ImageFont.truetype(os.path.join(font_dir, "arial.ttf"), 36)

draw.text((W // 2, 320), "AL-WAHA", font=title_font, fill=(255, 255, 255), anchor="mm")
draw.text((W // 2, 400), "MAKE JOY HAPPEN", font=sub_font, fill=(212, 175, 55), anchor="mm")
draw.text((W // 2, 470), "Premium Vape Brand", font=sub_font, fill=(180, 190, 210), anchor="mm")

out = r"C:\Users\Administrator\WorkBuddy\2026-07-15-10-13-35\images\og-image.png"
img.save(out)
print("Saved", out, os.path.getsize(out), "bytes")
