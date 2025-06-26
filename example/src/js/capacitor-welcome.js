import { SplashScreen } from '@capacitor/splash-screen';
import { Camera } from '@capacitor/camera';
import { CapacitorMidi } from '@kurogedelic/capacitor-midi';

window.customElements.define(
  'capacitor-welcome',
  class extends HTMLElement {
    constructor() {
      super();

      SplashScreen.hide();

      const root = this.attachShadow({ mode: 'open' });

      root.innerHTML = `
    <style>
      :host {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        display: block;
        width: 100%;
        height: 100%;
      }
      h1, h2, h3, h4, h5 {
        text-transform: uppercase;
      }
      .button {
        display: inline-block;
        padding: 10px;
        background-color: #73B5F6;
        color: #fff;
        font-size: 0.9em;
        border: 0;
        border-radius: 3px;
        text-decoration: none;
        cursor: pointer;
      }
      main {
        padding: 15px;
      }
      main hr { height: 1px; background-color: #eee; border: 0; }
      main h1 {
        font-size: 1.4em;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      main h2 {
        font-size: 1.1em;
      }
      main h3 {
        font-size: 0.9em;
      }
      main p {
        color: #333;
      }
      main pre {
        white-space: pre-line;
      }
    </style>
    <div>
      <capacitor-welcome-titlebar>
        <h1>Capacitor</h1>
      </capacitor-welcome-titlebar>
      <main>
        <p>
          Capacitor makes it easy to build powerful apps for the app stores, mobile web (Progressive Web Apps), and desktop, all
          with a single code base.
        </p>
        <h2>Getting Started</h2>
        <p>
          You'll probably need a UI framework to build a full-featured app. Might we recommend
          <a target="_blank" href="http://ionicframework.com/">Ionic</a>?
        </p>
        <p>
          Visit <a href="https://capacitorjs.com">capacitorjs.com</a> for information
          on using native features, building plugins, and more.
        </p>
        <a href="https://capacitorjs.com" target="_blank" class="button">Read more</a>
        <h2>Tiny Demo</h2>
        <p>
          This demo shows how to call Capacitor plugins. Say cheese!
        </p>
        <p>
          <button class="button" id="take-photo">Take Photo</button>
        </p>
        <p>
          <img id="image" style="max-width: 100%">
        </p>
        <h2>MIDI Test</h2>
        <p>
          Test MIDI functionality on your device.
        </p>
        <p>
          <button class="button" id="test-midi">List MIDI Devices</button>
        </p>
        <p>
          <div id="midi-output" style="background-color: #f0f0f0; padding: 10px; margin-top: 10px; border-radius: 3px; white-space: pre-line;"></div>
        </p>
      </main>
    </div>
    `;
    }

    connectedCallback() {
      const self = this;

      self.shadowRoot
        .querySelector('#take-photo')
        .addEventListener('click', async function (e) {
          try {
            const photo = await Camera.getPhoto({
              resultType: 'uri',
            });

            const image = self.shadowRoot.querySelector('#image');
            if (!image) {
              return;
            }

            image.src = photo.webPath;
          } catch (e) {
            console.warn('User cancelled', e);
          }
        });

      // MIDI Test functionality
      let midiInitialized = false;
      let midiListener = null;

      self.shadowRoot
        .querySelector('#test-midi')
        .addEventListener('click', async function (e) {
          const outputDiv = self.shadowRoot.querySelector('#midi-output');
          const button = self.shadowRoot.querySelector('#test-midi');

          // Prevent multiple clicks
          if (button.disabled) return;
          button.disabled = true;
          button.textContent = 'Testing...';

          outputDiv.textContent = 'Testing MIDI...\n';

          try {
            // List MIDI devices
            const devices = await CapacitorMidi.listDevices();
            outputDiv.textContent += `MIDI devices found: ${JSON.stringify(devices, null, 2)}\n`;

            // Add MIDI message listener only once
            if (!midiInitialized) {
              midiListener = await CapacitorMidi.addListener(
                'commandReceive',
                event => {
                  console.log('MIDI message received:', event);
                  outputDiv.textContent += `MIDI message: ${JSON.stringify(event)}\n`;
                },
              );
              midiInitialized = true;
              outputDiv.textContent +=
                'MIDI listener added. Connect a MIDI device and send messages to see them here.\n';
            } else {
              outputDiv.textContent +=
                'MIDI already initialized. Connect a MIDI device and send messages to see them here.\n';
            }
          } catch (error) {
            console.error('MIDI error:', error);
            outputDiv.textContent += `MIDI error: ${error.message}\n`;
          } finally {
            // Re-enable button
            button.disabled = false;
            button.textContent = 'List MIDI Devices';
          }
        });

      // MIDI initialization removed to prevent infinite calls
    }

    async testMidi() {
      try {
        const devices = await CapacitorMidi.listDevices();
        console.log('MIDI devices:', devices);

        CapacitorMidi.addListener('commandReceive', event => {
          console.log('MIDI message received:', event);
        });
      } catch (error) {
        console.error('MIDI error:', error);
      }
    }
  },
);

window.customElements.define(
  'capacitor-welcome-titlebar',
  class extends HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `
    <style>
      :host {
        position: relative;
        display: block;
        padding: 15px 15px 15px 15px;
        text-align: center;
        background-color: #73B5F6;
      }
      ::slotted(h1) {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-size: 0.9em;
        font-weight: 600;
        color: #fff;
      }
    </style>
    <slot></slot>
    `;
    }
  },
);
