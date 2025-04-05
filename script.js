window.onload = function () {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size
    canvas.width = 800;
    canvas.height = 400;

    const player = {
        x: 50,
        y: 300, // Start near the ground
        width: 50,
        height: 50,
        speed: 5,
        velocityY: 0,
        gravity: 0.5,
        jumpStrength: -10,
        grounded: false,
        canDoubleJump: false, // Allows a second jump
        doubleJumpCutoff: 600, // Time in milliseconds to allow double jump
        lastJumpTime: 0 // Stores time of the first jump
    };

    // Camera object to keep track of view position
    const camera = {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height
    };

    const keys = {};
    let ignorePlatformCollision = false; // Flag to temporarily ignore platform collisions

    // Platform properties
    const platformWidth = canvas.width / 2; // Halfway across the canvas
    const platformHeight = 3; // Thickness of the platform
    const platformX = canvas.width / 4; // Starting from one-quarter across the canvas
    const platformY = canvas.height / 2; // Middle of the canvas vertically

    // Ground line properties (bottom of screen)
    const groundLineY = canvas.height - 50; // Position of the ground line
    const groundLineHeight = 3; // Thickness of the ground line
    const groundLineWidth = canvas.width * 3; // Make the ground wider than the screen
    const groundLineX = -canvas.width; // Start the ground before the visible area

    document.addEventListener("keydown", (event) => {
        if (event.code === "ArrowUp") {
            handleJump();
        }
        if (event.code === "ArrowDown") {
            ignorePlatformCollision = true; // Enable dropping through platforms
        }
        keys[event.code] = true;
    });

    document.addEventListener("keyup", (event) => {
        if (event.code === "ArrowDown") {
            ignorePlatformCollision = false; // Disable dropping through platforms
        }
        keys[event.code] = false;
    });

    function handleJump() {
        const now = performance.now(); // Get current time in milliseconds

        if (player.grounded) {
            // First jump
            player.velocityY = player.jumpStrength;
            player.grounded = false;
            player.canDoubleJump = true;
            player.lastJumpTime = now; // Store first jump time
        } else if (player.canDoubleJump && now - player.lastJumpTime <= player.doubleJumpCutoff) {
            // Double jump allowed only if within cutoff time
            player.velocityY = player.jumpStrength;
            player.canDoubleJump = false; // Disable further jumps until landing
        }
    }

    function update() {
        // Apply gravity if not on the ground
        if (!player.grounded) {
            player.velocityY += player.gravity;
        }

        // Move left and right
        if (keys["ArrowLeft"]) {
            player.x -= player.speed;
        }
        if (keys["ArrowRight"]) {
            player.x += player.speed;
        }

        // Apply vertical movement
        player.y += player.velocityY;

        // Ground collision with the line at the bottom of the screen
        if (player.y + player.height >= groundLineY) {
            player.y = groundLineY - player.height; // Stop at ground level (line position)
            player.velocityY = 0; // Reset vertical velocity
            player.grounded = true; // Mark as grounded
            player.canDoubleJump = false; // Reset double jump on landing
        } else {
            player.grounded = false;
        }

        // Platform collision check (with drop-through logic)
        if (
            !ignorePlatformCollision && // Only check collision when not dropping through
            player.velocityY > 0 && // Only when falling downwards
            player.y + player.height >= platformY && // Bottom of the player at or below platform top
            player.y + player.height - player.velocityY <= platformY && // Prevent clipping through platform
            player.x + player.width > platformX && 
            player.x < platformX + platformWidth
        ) {
            // Land on the platform
            player.y = platformY - player.height;
            player.velocityY = 0;
            player.grounded = true;
            player.canDoubleJump = false; // Reset double jump on landing
        }
        // Debug grounding state after all grounding logic
console.log("[DEBUG] Grounding check: grounded =", player.grounded, 
    "| y =", player.y, 
    "| velocityY =", player.velocityY, 
    "| onGroundLine =", (player.y + player.height >= groundLineY), 
    "| onPlatform =", (
        !ignorePlatformCollision &&
        player.velocityY > 0 &&
        player.y + player.height >= platformY &&
        player.y + player.height - player.velocityY <= platformY &&
        player.x + player.width > platformX &&
        player.x < platformX + platformWidth
    )
);


        // Update camera position to center on player
        camera.x = player.x + player.width / 2 - canvas.width / 2;
        camera.y = player.y + player.height / 2 - canvas.height / 2;

        draw();
        requestAnimationFrame(update);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Save the current context state
        ctx.save();
        
        // Translate context to simulate camera movement (negative because we move view in opposite direction)
        ctx.translate(-camera.x, -camera.y);
        
        // Draw ground line (bottom of screen, wider than canvas)
        ctx.fillStyle = "black";
        ctx.fillRect(groundLineX, groundLineY, groundLineWidth, groundLineHeight);
        
        // Draw platform (middle of screen)
        ctx.fillStyle = "black";
        ctx.fillRect(platformX, platformY, platformWidth, platformHeight);
        
        // Draw player (blue square)
        ctx.fillStyle = "blue";
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // Restore the context state
        ctx.restore();
    }

    update();
};
