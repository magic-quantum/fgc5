git clone https://www.github.com/odoo/odoo --depth 1 --branch 16.0 /opt/odoo/odoo
ls
python3 -m venv odoo-venv
source odoo-venv/bin/activate
pip3 install wheel
pip3 install -r odoo/requirements.txt
deactivate
sudo nano /etc/odoo.conf
exit
