var z = require('zengming');
var BMP24 = z.BMP24;
var font = z.Font;

function makeCaptcha(str) {
    var img = new BMP24(100, 40);
    img.fillRect(0, 0, img.w-1, img.h-1, 0xffffff);
    img.drawCircle(11, 11, 10, z.rand(0, 0xffffff));
    // img.drawRect(0, 0, img.w-1, img.h-1, z.rand(0, 0xffffff));
    // img.fillRect(53, 15, 88, 35, z.rand(0, 0xffffff));
    img.drawLine(50, 6, 3, 60, z.rand(0, 0xffffff));
    //return img;

    //画曲线
    var w=img.w/2;
    var h=img.h;
    var color = z.rand(0, 0xffffff);
    var y1=z.rand(-5,5); //Y轴位置调整
    var w2=z.rand(10,15); //数值越小频率越高
    var h3=z.rand(4,6); //数值越小幅度越大
    var bl = z.rand(1,5);
    for(var i=-w; i<w; i+=0.1) {
        var y = Math.floor(h/h3*Math.sin(i/w2)+h/2+y1);
        var x = Math.floor(i+w);
        for(var j=0; j<bl; j++){
            img.drawPoint(x, y+j, color);
        }
    }

    var fonts = [font.font8x16, font.font12x24, font.font16x32];
    var x = 15, y=8;
    for(var i=0; i<str.length; i++){
        var f = fonts[Math.random() * fonts.length |0];
        y = 8 + z.rand(-10, 10);
        img.drawChar(str[i], x, y, f, z.rand(0x111111, 0x333333));
        x += f.w + z.rand(2, 8);
    }
    return img
}

module.exports = makeCaptcha
