        window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 900;
    canvas.height = 900;
    // canvas settings
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 5;
    ctx.shadowBlur = 10;

    const canvas2 = document.getElementById('canvas2');
    const ctx2 = canvas2.getContext('2d');
    canvas2.width = window.innerWidth;
    canvas2.height = window.innerHeight;

    class Fractal {
        constructor(canvasWidth, canvasHeight){
            this.canvasWidth = canvasWidth;
            this.canvasHeight = canvasHeight;
            this.size = this.canvasWidth < this.canvasHeight ? this.canvasHeight * 0.3 : this.canvasHeight * 0.3;
            this.maxLevel = 7;
            this.scale = 0.3;
            this.branches = 3;
            this.spread = 1;
            this.color = 'hsl(0, 0%, 100%)';
            this.lineWidth = 6;
            this.sides = Math.floor(21);
        }
        #drawBranch(level, context){
        if (level > this.maxLevel) return;
        context.beginPath();
        context.moveTo(0,0);
        context.lineTo(this.size, 0);
        context.stroke();
            context.save();
            context.translate(this.size * 0.1, 0);
            context.scale(this.scale, this.scale);
            context.save();
            context.rotate(this.spread);
            this.#drawBranch(level + 1, context);
            context.restore();
            context.restore();

            context.save();
            context.translate(this.size * 0.5, 0);
            context.scale(this.scale, this.scale);
            context.save();
            context.rotate(this.spread * 1.5);
            this.#drawBranch(level + 1, context);
            context.restore();
            context.restore();

            context.save();
            context.translate(this.size * 0.6, 0);
            context.scale(this.scale * 0.3, this.scale * 0.3);
            context.save();
            context.rotate(this.spread * 0.5);
            this.#drawBranch(level + 1, context);
            context.restore();
            context.restore();

            context.beginPath();
            context.arc(this.size * 1.1,0,this.size * 0.09, 0, Math.PI * 1);
            context.fill();
    }
        draw(context){
            context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            context.strokeStyle =  this.color;
            context.fillStyle =  this.color;
            context.lineWidth = this.lineWidth;
            context.save();
            context.translate(this.canvasWidth/2, this.canvasHeight/2);
            for (let i = 0; i < this.sides; i++){
                context.rotate((Math.PI * 2)/this.sides);
                this.#drawBranch(0, context);
            }
            context.restore();
        }
    }

    class Rain {
        constructor(canvasWidth, canvasHeight, image, ctx){
            this.canvasWidth = canvasWidth;
            this.canvasHeight = canvasHeight;
            this.numberOfParticles = 3;
            this.particles = [];
            this.image = image;
            this.ctx = ctx;
            this.initialize()
        }
        initialize(){
            for (let i = 0; i < this.numberOfParticles; i++){
                this.particles.push(new Particle(this.canvasWidth, this.canvasHeight, this.image))
            }
        }
        run(){
            this.particles.forEach(particle => {
                particle.draw(this.ctx);
                particle.update();
            });
        }

    }

    class Particle {
        constructor(canvasWidth, canvasHeight, image){
            this.canvasWidth = canvasWidth;
            this.canvasHeight = canvasHeight;
            this.image = image;

            this.sizeModifier = Math.random() * 0.3 + 0.7;
            this.width = this.image.width * this.sizeModifier;
            this.height = this.image.height * this.sizeModifier;
            this.x = Math.random() * this.canvasWidth; 
            this.y = Math.random() * this.canvasHeight;
            this.speed = Math.random() * 1 + 1;
            this.image = image;
            this.angle = 0;
            this.va = Math.random() * 0.05 - 0.025;

        }
        update(){
            this.angle += this.va;
            if (this.y < -this.height) {
                this.y = this.canvasHeight + this.height;
                this.x = Math.random() * (this.canvasWidth - this.width); 
                this.angle = 0;
            } else this.y -= this.speed;
        }
        draw(context){
            context.save();
            context.translate(this.x, this.y );
            context.rotate(this.angle);
            context.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height)
            context.restore();
        }
    }
    const fractal = new Fractal(canvas.width, canvas.height);
    fractal.draw(ctx);
    const fractalImage = new Image();
    fractalImage.src = canvas.toDataURL();

    fractalImage.onload = function(){
        const rain = new Rain(canvas2.width, canvas2.height, fractalImage, ctx2);
        rain.initialize();

        function animate(){
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
        rain.run();
        requestAnimationFrame(animate);
    }
    animate();
    }

})