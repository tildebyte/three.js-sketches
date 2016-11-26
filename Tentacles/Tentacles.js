/* A sketch inspired by (a radical misinterpretation of) the math from the
JS1K segment of Steven Wittens' "Making Things With Maths" video. Really,
everything is mine except the math in `segment.py`. See also
http://acko.net/blog/js1k-demo-the-making-of

Converted from Processing.py implementation (!?) to p5.js by Ben Alkov 2016-11-14.
*/

let clock = 0
const TICK = 1 / 90
const SPHERERADIUS = 200
let Tentacles = []

class Segment {
   /* A Segment, which encapsulates its own position and color, and can draw
   itself */

   constructor(segId, tickOffset, altitude, segColor) {
      this.segId = segId
         // This essentially represents the distance between segments.
      this.tickOffset = tickOffset *= 4 // '4' is a magic number; it looks good.
      this.altitude = altitude
         // A magic number. Gap between full brightness and the lowest brightness
         //     which retains a sense of color, divided by number of segments. -ish.
      this.darken = 5.3
      let [h, s, b, a] = Segment.decompColor(segColor)
      this.color = color(h, s, b - this.segId * this.darken, a)
      this.loc = createVector(0.0, 0.0, 0.0)
   }

   calc(_clock) {
      // Spherical coords.
      // New formula from http://acko.net/blog/js1k-demo-the-making-of
      let lon = cos(_clock + sin(_clock * 0.31)) * 2 +
         sin(_clock * 0.83) * 3 +
         _clock * 0.02
      let lat = sin(_clock * 0.7) -
         cos(3 + _clock * 0.23) * 3
         // Convert to cartesian 3D.
         // http://acko.net/blog/js1k-demo-the-making-of
      this.loc.set(cos(lon) * cos(lat) * (SPHERERADIUS + this.altitude),
         sin(lon) * cos(lat) * (SPHERERADIUS + this.altitude),
         sin(lat) * (SPHERERADIUS + this.altitude))
   }

   drawSelf(other) {
      let [h, s, b, a] = Segment.decompColor(this.color)
      this.color = color(h, s, b, map(a, -SPHERERADIUS, SPHERERADIUS, 0, 1))
      stroke(this.color)
         // line(this.loc.x, this.loc.y, this.loc.z,
         //      other.loc.x, other.loc.y, other.loc.z)
      line(this.loc.x, this.loc.y,
         other.loc.x, other.loc.y)
   }

   static decompColor(color) {
      return [hue(color), saturation(color), brightness(color), alpha(color)]
   }
}

class Tentacle {
   /* A Tentacle made of Segments.
    */
   constructor(timeOffset, basecolor) {
      this.AltiOffset = 1
      this.numSegments = 15
      this.timeOffset = timeOffset
      this.basecolor = basecolor
      this.segments = []
      for (let segId of range(this.numSegments)) {
         // Second `segId` is tickOffset.
         this.segments[segId] = new Segment(segId, segId,
            this.AltiOffset,
            this.basecolor)
      }
   }

   update(_clock) {
      for (let seg of this.segments) {
         seg.calc(_clock - this.timeOffset - seg.tickOffset * TICK,
               SPHERERADIUS)
            // Don't try to draw *from* the last segment.
         if (seg.segId !== this.segments.length - 1) {
            // Draw from this segment to the next segment.
            seg.drawSelf(this.segments[seg.segId + 1])
         }
      }
   }
}

function lighting() {
   ambientLight(212, 30, 25)
   directionalLight(69, 23, 30, -1, 1, 0)
   directionalLight(212, 13, 8, 1, -1, 0)
}

function rightHanded() {
   // Fix flippin' coordinate system.
   // Not the *same* as right-handed, but good enough.
   // `-z` comes out of the screen.
   // rotateX(TAU / 2)  // `Y` up.
   translate(256, 256, 0) // Centered.
}

function setup() {
   createCanvas(512, 512)
   strokeWeight(4)
   strokeJoin(ROUND)
   strokeCap(ROUND)
   colorMode(HSB)
   background(0)
   const Colors = [color(212, 30, 94, 1), // blue
         color(5, 20, 95, 1), // red
         color(69, 40, 74, 1)
      ] // green
   for (let idx of range(6)) {
      Tentacles[idx] = new Tentacle(idx * -100, Colors[idx % 3])
   }
}

function draw() {
   // lighting()
   background(0)
   rightHanded()
      // sphere(SPHERERADIUS, 40, 40)
   clock += TICK
   for (let tentacle of Tentacles) {
      tentacle.update(clock)
   }
}
