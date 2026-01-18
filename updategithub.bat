@echo off
echo Dang cap nhat code cho dự án GiaoHangTanNoi...
:: Lay code moi nhat ve truoc
git pull origin main --allow-unrelated-histories
:: Them tat ca thay doi
git add .
:: Nhap ghi chu
set /p desc="Nhap noi dung ban da sua: "
git commit -m "%desc%"
:: Day len GitHub
git push origin main
echo ---
echo DA CAP NHAT THANH CONG!
pause