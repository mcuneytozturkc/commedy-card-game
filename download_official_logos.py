#!/usr/bin/env python3
"""
72 logoyu resmi kaynaklardan indirir.
Kullanim:
    pip install requests
    python download_official_logos.py
Cikti: ./logos_official/<NN>_<Marka>.png

Not: Varsayilan olarak Clearbit Logo API kullanir (logo.clearbit.com/<domain>).
Bazi markalarin (Batman, Superman, Hello Kitty, UNO, Linux...) tek bir sirket
domaini yoktur; onlar icin en yakin marka/yayinci domaini kullanildi ve
indirilemezse atlanir. Alternatif kaynak icin LOGO_API'yi degistirebilirsin:
    - Clearbit:  https://logo.clearbit.com/{domain}
    - logo.dev:  https://img.logo.dev/{domain}?token=YOUR_TOKEN  (ucretsiz token gerekir)
"""
import os, time, requests

LOGO_API = "https://logo.clearbit.com/{domain}?size=512&format=png"

# (sira_no, Marka adi, domain)  -- domain None ise atlanir
BRANDS = [
    ("X-Box", "xbox.com"),
    ("Dunlop", "dunlop.eu"),
    ("General-Motors", "gm.com"),
    ("Lacoste", "lacoste.com"),
    ("Shell", "shell.com"),
    ("Puma", "puma.com"),
    ("Superman", "dc.com"),
    ("KLM", "klm.com"),
    ("Yamaha", "yamaha-motor.com"),
    ("Batman", "dc.com"),
    ("HSBC", "hsbc.com"),
    ("Electronic-Arts", "ea.com"),
    ("Michelin", "michelin.com"),
    ("Hello-Kitty", "sanrio.com"),
    ("Renault", "renault.com"),
    ("LG", "lg.com"),
    ("Garnier", "garnier.com"),
    ("Polo-Ralph-Lauren", "ralphlauren.com"),
    ("Rolex", "rolex.com"),
    ("ATT", "att.com"),
    ("Mercedes-Benz", "mercedes-benz.com"),
    ("Adidas", "adidas.com"),
    ("Honda", "honda.com"),
    ("UNICEF", "unicef.org"),
    ("Mitsubishi", "mitsubishi.com"),
    ("Marlboro", "marlboro.com"),
    ("Wikipedia", "wikipedia.org"),
    ("Volkswagen", "volkswagen.com"),
    ("WHO", "who.int"),
    ("Lufthansa", "lufthansa.com"),
    ("Mazda", "mazda.com"),
    ("Xerox", "xerox.com"),
    ("Chevrolet", "chevrolet.com"),
    ("Sony-Ericsson", "sonymobile.com"),
    ("Red-Bull", "redbull.com"),
    ("Singapore-Airlines", "singaporeair.com"),
    ("Ferrari", "ferrari.com"),
    ("Thai-Airways", "thaiairways.com"),
    ("Nestle", "nestle.com"),
    ("Dominos-Pizza", "dominos.com"),
    ("Manchester-United", "manutd.com"),
    ("Calvin-Klein", "calvinklein.com"),
    ("Symantec", "broadcom.com"),
    ("Opel", "opel.com"),
    ("Bacardi", "bacardi.com"),
    ("Linux", "linuxfoundation.org"),
    ("Aiwa", "aiwa.co"),
    ("Ticket-Restaurant", "edenred.com"),
    ("Bridgestone", "bridgestone.com"),
    ("UNO", "mattel.com"),
    ("Adobe-Flash", "adobe.com"),
    ("Hilton", "hilton.com"),
    ("History-Channel", "history.com"),
    ("PlayStation", "playstation.com"),
    ("Animal-Planet", "animalplanet.com"),
    ("Motorola", "motorola.com"),
    ("Polaroid", "polaroid.com"),
    ("Cingular", "att.com"),
    ("Cartoon-Network", "cartoonnetwork.com"),
    ("Univision", "univision.com"),
    ("ING", "ing.com"),
    ("Red-Hat", "redhat.com"),
    ("iTunes", "apple.com"),
    ("Napster", "napster.com"),
    ("International-Cricket-Council", "icc-cricket.com"),
    ("Reebok", "reebok.com"),
    ("Netscape", "netscape.com"),
    ("American-Express", "americanexpress.com"),
    ("Kodak", "kodak.com"),
    ("NBC-Universal", "nbcuniversal.com"),
    ("Tata", "tata.com"),
    ("Boeing", "boeing.com"),
]

OUT = "logos_official"
os.makedirs(OUT, exist_ok=True)

ok, fail = 0, 0
for i, (name, domain) in enumerate(BRANDS, 1):
    fn = os.path.join(OUT, f"{i:02d}_{name}.png")
    if not domain:
        print(f"[ATLA] {i:02d} {name} (domain yok)")
        fail += 1
        continue
    url = LOGO_API.format(domain=domain)
    try:
        r = requests.get(url, timeout=20, headers={"User-Agent": "Mozilla/5.0"})
        if r.status_code == 200 and r.content[:4] in (b"\x89PNG", b"\xff\xd8\xff\xe0", b"\xff\xd8\xff\xe1"):
            with open(fn, "wb") as f:
                f.write(r.content)
            print(f"[OK]   {i:02d} {name}  <- {domain}")
            ok += 1
        else:
            print(f"[YOK]  {i:02d} {name}  ({domain}) HTTP {r.status_code}")
            fail += 1
    except Exception as e:
        print(f"[HATA] {i:02d} {name}  ({domain}) {e}")
        fail += 1
    time.sleep(0.3)

print(f"\nBitti. Basarili: {ok}  /  Eksik: {fail}")
print(f"Klasor: {os.path.abspath(OUT)}")
