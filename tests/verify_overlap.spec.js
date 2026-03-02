const { test, expect } = require('@playwright/test');

test('verify hand-arrow overlap detection', async ({ page }) => {
  await page.goto('http://localhost:8080');

  // Wait for the app to initialize
  await page.waitForFunction(() => window.__vr_data && window.THREE);

  // Trigger hover via script injection
  const isHovering = await page.evaluate(async () => {
    const { leftArrow, handMarkers, scene, camera } = window.__vr_data;
    const THREE = window.THREE;

    // Position the hand marker 8 (index tip) exactly at the left arrow's world position
    const arrowWorldPos = new THREE.Vector3();
    leftArrow.getWorldPosition(arrowWorldPos);

    // We need to set the marker's position and make it visible
    handMarkers[0][8].position.copy(arrowWorldPos);
    // Convert arrowWorldPos to camera-relative position because handMarkers are children of camera
    camera.worldToLocal(handMarkers[0][8].position);
    handMarkers[0][8].visible = true;

    // Run one iteration of the logic (or wait for the next frame)
    // Since we're in the browser context, let's wait a bit for the animation loop to run
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Check if the color changed to yellow (0xffff00)
    return leftArrow.material.color.getHex() === 0xffff00;
  });

  expect(isHovering).toBe(true);
});
