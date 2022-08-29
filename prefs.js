'use strict';

const { Adw, Gio, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


function init() {
}

function fillPreferencesWindow(window) {
    // Use the same GSettings schema as in `extension.js`
    const settings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.colin.kinloch.desktop-zoom');
    
    // Create a preferences page and group
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup();
    page.add(group);

    // Create a new preferences row
    const row = new Adw.ActionRow({ title: 'Enable on Scroll' });
    group.add(row);

    // Create the switch and bind its value to the `show-indicator` key
    const toggle = new Gtk.Switch({
        active: settings.get_boolean ('enable-on-scroll'),
        valign: Gtk.Align.CENTER,
    });
    settings.bind(
        'enable-on-scroll',
        toggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );

    // Add the switch to the row
    row.add_suffix(toggle);
    row.activatable_widget = toggle;

    const row2 = new Adw.ActionRow({ title: 'Zoom Rate' });
    group.add(row2);
    
    const spin_adj = new Gtk.Adjustment({
      lower: 0.01,
      upper: 2,
      step_increment: 0.01,
      value: settings.get_double('mag-factor-delta'),
    })
    
    const spin = new Gtk.SpinButton({
      digits: 2,
      climb_rate: 0.01,
      adjustment: spin_adj,
    })

    settings.bind(
      'mag-factor-delta',
      spin_adj,
      'value',
      Gio.SettingsBindFlags.DEFAULT)

    // Add the switch to the row
    row2.add_suffix(spin);
    row2.activatable_widget = spin;

    // Add our page to the window
    window.add(page);
}
