import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 720})
        await page.goto("http://localhost:8085/index.html")
        await page.wait_for_timeout(2000)

        # Open settings
        await page.click('#gear')
        await page.wait_for_timeout(500)

        # Turn ON Art VI State Mode
        await page.click('#state-mode-toggle')
        await page.wait_for_timeout(500)

        # Take screenshot showing state mode and legend
        await page.screenshot(path="/home/jules/verification/article_vi_state_mode.png")
        print("Screenshot saved to /home/jules/verification/article_vi_state_mode.png")

        await browser.close()

asyncio.run(run())
