git clone https://github.com/fvalle1/graphic-assets

cp graphic-assets/logos/vertical/Logo\ vertical\ lightbg.png /usr/share/calamares/branding/default/squid.png
cp graphic-assets/logos/vertical/Logo\ vertical\ lightbg.png /usr/share/pixmaps/fedora-logo.png
cp graphic-assets/logos/vertical/Logo\ vertical\ lightbg.png /usr/share/pixmaps/fedora-logo-sprite.png
cp graphic-assets/logos/horizontal/Logo\ horizontal\ lightbg.png /usr/share/pixmaps/fedora-logo-small.png
cp graphic-assets/logos/horizontal/Logo\ horizontal\ darkbg.png /usr/share/pixmaps/system-logo-white.png
cp graphic-assets/favicon/mstile-70x70.png /usr/share/icons/hicolor/48x48/apps/anaconda.png
cp graphic-assets/favicon/mstile-70x70.png /usr/share/icons/hicolor/48x48/apps/fedora-logo-icon.png
rm -f /usr/share/wallpapers/F37/contents/images/*.png
rm -f /usr/share/backgrounds/xfce/*.svg
cp graphic-assets/logos/vertical/Logo\ vertical\ darkbg.png /usr/share/wallpapers/F37/contents/images/720x1440.png
cp graphic-assets/wallpapers/4K/yellow_black/1_nologo.png /usr/share/wallpapers/F37/contents/images/1920x1080.png
cp graphic-assets/wallpapers/4K/yellow_black/1_nologo.png /usr/share/wallpapers/F37/contents/images/3840x2160.png
cp graphic-assets/wallpapers/4K/yellow_black/1_nologo.png /usr/share/backgrounds/xfce/xfce-shapes.png
cp graphic-assets/wallpapers/4K/yellow_black/1_nologo.png /usr/share/backgrounds/default.png
sed -i 's/.webp/.png/' /usr/share/wallpapers/F37/metadata.desktop &>/dev/null || :
cp graphic-assets/marks/Marchio\ black.svg /usr/share/icons/hicolor/scalable/places/start-here.svg
cp graphic-assets/marks/Marchio\ black.svg /usr/share/icons/hicolor/scalable/apps/start-here.svg
# login page
cp graphic-assets/wallpapers/4K/yellow_black/1_nologo.png /usr/share/sddm/themes/01-breeze-fedora/components/artwork/background.png
cp graphic-assets/wallpapers/4K/yellow_black/1.png /usr/share/sddm/themes/01-breeze-fedora/preview.png

#cockpit
cp graphic-assets/wallpapers/4K/yellow_black/2_nologo.png /usr/share/cockpit/branding/default/bg-plain.jpg
cp graphic-assets/favicon/favicon.ico /usr/share/cockpit/branding/default/favicon.ico
cp graphic-assets/favicon/favicon.ico /usr/share/cockpit/branding/ubuntu/favicon.ico
cp graphic-assets/favicon/favicon.ico /usr/share/cockpit/branding/centos/favicon.ico
cp graphic-assets/favicon/favicon.ico /usr/share/cockpit/branding/fedora/favicon.ico


rm -rf graphic-assets
