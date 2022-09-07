'use strict';

const { Adw, Gio, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


function init() {
}

function fillPreferencesWindow(window) {
    // Use the same GSettings schema as in `extension.js`
    const extensionSettings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.desktop-zoom');
    const a11ySettings = new Gio.Settings(
        { schema_id: 'org.gnome.desktop.a11y.applications' });
    const magnifierSettings = new Gio.Settings(
        { schema_id: 'org.gnome.desktop.a11y.magnifier' });
    
    // Create a preferences page and group
    const page = new Adw.PreferencesPage();
    const baseGroup = new Adw.PreferencesGroup({
      title: "GNOME Accessibility Zoom Settings"
    });
    const extGroup = new Adw.PreferencesGroup({
      title: 'Extension "Desktop Zoom" Settings'
    });
    page.add(baseGroup);
    page.add(extGroup);
    
    const baseZoomRow = new Adw.ActionRow({ title: 'Enable Zoom'});
    
    const baseZoomSwitch = new Gtk.Switch({
        active: a11ySettings.get_boolean ('screen-magnifier-enabled'),
        valign: Gtk.Align.CENTER,
    })
    
    a11ySettings.bind(
        'screen-magnifier-enabled',
        baseZoomSwitch,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    )
    
    baseZoomRow.add_suffix(baseZoomSwitch);
    baseZoomRow.activatable_widget = baseZoomSwitch;

    const zoomLevelRow = new Adw.ActionRow({ title: 'Zoom Level' });
    
    const zoomLevelAdj = new Gtk.Adjustment({
      lower: 1.0,
      upper: 20.0,
      step_increment: 0.25,
      value: magnifierSettings.get_double('mag-factor'),
    });
    
    const zoomLevelSpin = new Gtk.SpinButton({
      digits: 2,
      climb_rate: 0.25,
      adjustment: zoomLevelAdj,
    })
    
    magnifierSettings.bind(
      'mag-factor',
      zoomLevelSpin,
      'value',
      Gio.SettingsBindFlags.DEFAULT)
    
    zoomLevelRow.add_suffix(zoomLevelSpin)
    zoomLevelRow.activatable_widget = zoomLevelSpin

    // Create a new preferences row
    const enableZoomOnScrollRow = new Adw.ActionRow({ title: 'Enable on Scroll' });

    // Create the switch and bind its value to the `show-indicator` key
    const toggle = new Gtk.Switch({
        active: extensionSettings.get_boolean ('enable-on-scroll'),
        valign: Gtk.Align.CENTER,
    });
    extensionSettings.bind(
        'enable-on-scroll',
        toggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );

    // Add the switch to the row
    enableZoomOnScrollRow.add_suffix(toggle);
    enableZoomOnScrollRow.activatable_widget = toggle;

    const zoomRateRow = new Adw.ActionRow({ title: 'Zoom Rate' });
    
    const zoomRateAdj = new Gtk.Adjustment({
      lower: 0.01,
      upper: 2,
      step_increment: 0.01,
      value: extensionSettings.get_double('mag-factor-delta'),
    })
    
    const zoomRateSpin = new Gtk.SpinButton({
      digits: 2,
      climb_rate: 0.01,
      adjustment: zoomRateAdj,
    })

    extensionSettings.bind(
      'mag-factor-delta',
      zoomRateAdj,
      'value',
      Gio.SettingsBindFlags.DEFAULT)

    // Add the switch to the row
    zoomRateRow.add_suffix(zoomRateSpin);
    zoomRateRow.activatable_widget = zoomRateSpin;

    baseGroup.add(baseZoomRow);
    baseGroup.add(zoomLevelRow);
    extGroup.add(enableZoomOnScrollRow);
    extGroup.add(zoomRateRow);

    // Add our page to the window
    window.add(page);
}
