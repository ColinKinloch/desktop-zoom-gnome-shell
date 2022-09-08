'use strict';

/* TODO: Settings panel:
 *  * Set tstate
 * 
 * TODO: Doesn't work when cursor is over a window
 * 
 * TODO: Nearest neighbor feasibility
 */


const { panelMenu, extensionSystem, main } = imports.ui;
const { lang, signals } = imports;
const ExtensionUtils = imports.misc.extensionUtils;

const {
  GObject,
  GLib,
  Gio,
  St,
  Clutter,
} = imports.gi

let magnifierSettings
let extensionSettings
let a11ySettings
let mag_factor
let mag_factor_delta
let enable_on_scroll

const tstate = Clutter.ModifierType.MOD1_MASK


const DesktopZoomGestureAction = new lang.Class({
  Name: 'DesktopZoomGestureAction',

  _init: function(actor) {
    this._gestureCallbackID2 = actor.connect('scroll-event', lang.bind(this, this._handleEvent));
    this.dragState = 0
    this.dragAction = null
    //this.virtualMouse = Clutter.DeviceManager.get_default().create_virtual_device(Clutter.InputDeviceType.POINTER_DEVICE)
    this.grabbedMouse = null
    this.scrollTimer = GLib.get_monotonic_time()
  },

  _handleEvent: function(actor, event) {
    if ((event.get_state() & tstate) === tstate &&
      event.get_scroll_direction() === Clutter.ScrollDirection.SMOOTH) {
      
      mag_factor = magnifierSettings.get_double('mag-factor')
      const now = GLib.get_monotonic_time()
      const dt = now - this.scrollTimer
      this.scrollTimer = now
      const v = event.get_scroll_delta()[1]
      mag_factor = Math.max(1.0, mag_factor - (v * mag_factor_delta))
      
      print(mag_factor)
      if (enable_on_scroll) {
        magnifierSettings.set_double('mag-factor', mag_factor)
        if (mag_factor <= 1.005) {
          print('Disabling accessibility magnifier')
          a11ySettings.set_boolean('screen-magnifier-enabled', false)
        } else if (!St.Settings.get().magnifier_active) {
          print('Enabling accessibility magnifier')
          //mag_factor = 1.0
          a11ySettings.set_boolean('screen-magnifier-enabled', true)
        }
      } else if (St.Settings.get().magnifier_active) {
        magnifierSettings.set_double('mag-factor', mag_factor)
      } else {
        return false
      }
      
      return true;
    }
    
    return false
  },

  _cleanup: function() {
    global.stage.disconnect(this._gestureCallbackID);
    global.stage.disconnect(this._gestureCallbackID2);
  }
});

class Extension {
  constructor() {
  }

  enable() {
    extensionSettings = ExtensionUtils.getSettings('org.gnome.shell.extensions.desktop-zoom')
    magnifierSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.a11y.magnifier' })
    a11ySettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.a11y.applications' })
    
    mag_factor = 1.0
    magnifierSettings.set_double('mag-factor', mag_factor)
    a11ySettings.set_boolean('screen-magnifier-enabled', false)
    
    //mag_factor = magnifierSettings.get_double('mag-factor')
    mag_factor_delta = extensionSettings.get_double('mag-factor-delta')
    enable_on_scroll = extensionSettings.get_boolean('enable-on-scroll')

    extensionSettings.connect('changed::mag-factor-delta', () => {
      mag_factor_delta = extensionSettings.get_double('mag-factor-delta')
    })
    extensionSettings.connect('changed::enable-on-scroll', () => {
      enable_on_scroll = extensionSettings.get_boolean('enable-on-scroll')
    })

    signals.addSignalMethods(DesktopZoomGestureAction.prototype);
    this.gestureHandler = new DesktopZoomGestureAction(global.stage);
  }

  disable() {
    mag_factor = 1.0
    magnifierSettings.set_double('mag-factor', mag_factor)
    a11ySettings.set_boolean('screen-magnifier-enabled', false)
    
    this.gestureHandler._cleanup();
    extensionSettings = null;
    magnifierSettings = null;
    a11ySettings = null;
    this.gestureHandler = null;
  }
}

function init() {
  return new Extension()
}
