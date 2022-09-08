class BuildingSwatch {
  constructor(omegga, config, store) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;

    this.playerData = {};
  }

  async init() {
    this.omegga
      .on('cmd:swatch', this.swatch);

    return {
      registeredCommands: ['swatch']
    };
  }

  unauthorized(senderName) {
    const player = this.omegga.getPlayer(senderName);
    if (
      this.config['only-authorized'] && !player.isHost() &&
      (
        (!this.config['authorized-users'] || !this.config['authorized-users'].some(p => player.id === p.id)) &&
        (!this.config['authorized-roles'] || !player.getRoles().some(role => this.config['authorized-roles'].includes(role)))
      )
    ) {
      this.omegga.whisper(senderName, '<color="ff0000">Unauthorized to use command.</>');
      return true;
    }
    return false;
  }

  swatch = async (senderName, ...args) => {
    try {
      if (this.unauthorized(senderName)) return;
      if (!args || args.length === 0 || args.length === 2 || args.length > 3) {
        this.omegga.whisper(senderName, 'Invalid arguments ("/swatch #FFFFFF" or "/swatch 255 255 255")');
        return;
      }
      let rgb;
      if (args.length === 1) {
        const hex = args[0].replace(/#/g, '');
        if (!(hex.length === 6 || hex.length === 3)) {
          this.omegga.whisper(senderName, 'Hex has invalid length');
          return;
        }
        rgb = hexToRgb(hex);
      } else {
        rgb = args.map(arg => +arg)
      }
      const saveData = {
        bricks: [
          {
            color: global.OMEGGA_UTIL.color.linearRGB(rgb),
            size: [5, 5, 2],
            position: [0, 0, 0],
            owner_index: 0
          }
        ]
      }

      const player = this.omegga.getPlayer(senderName);
      await player.loadSaveData(saveData);
      const hex = global.OMEGGA_UTIL.color.rgbToHex(rgb);
      this.omegga.whisper(senderName, `Generated brick with color <color="#${hex}">#${hex.toUpperCase()}</>`);
    } catch (e) {
      console.log(`plugin error is caused by ${senderName}`, e);
    }
  }

  stop() {
    this.omegga
      .removeListener('cmd:swatch', this.swatch);
  }
}

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

module.exports = BuildingSwatch;