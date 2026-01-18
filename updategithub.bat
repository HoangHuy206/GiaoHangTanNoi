@echo off
echo Dang cap nhat code len GitHub...
git add .
set /p desc="Nhap noi dung thay doi (VD: Sua loi font): "
git commit -m "%desc%"
git push
echo ---
echo DA CAP NHAT THANH CONG!
pause