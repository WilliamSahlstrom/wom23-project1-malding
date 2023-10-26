const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

describe('Your Web App', function () {
    let driver;

    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function () {
        //await driver.quit();
    });

    it('should open the landing page', async function () {
        this.timeout(10000); // Increase the timeout to 10 seconds

        console.log('Navigating to the landing page...');
        await driver.get('http://localhost:3030/public');

        console.log('Waiting for the title to be "Welcome to Your App"...');
        await driver.wait(until.titleIs('Welcome to Your App'), 10000);

        console.log('Page title:', await driver.getTitle());
        assert.strictEqual(await driver.getTitle(), 'Welcome to Your App');
    });

    it('should navigate to the login page and submit the form', async function () {
        console.log('Navigating to the login page...');
        await driver.get('http://localhost:3030/public/login/index.html');

        console.log('Waiting for the title to be "Login"...');
        await driver.wait(until.titleIs('Login'), 10000);

        console.log('Page title:', await driver.getTitle());
        assert.strictEqual(await driver.getTitle(), 'Login');

        // Add explicit wait for elements to be present
        const emailInput = await driver.wait(until.elementLocated(By.id('email')));
        const passwordInput = await driver.wait(until.elementLocated(By.id('password')));
        const submitButton = await driver.wait(until.elementLocated(By.id('send')));

        console.log('Filling out login form...');
        await emailInput.sendKeys('lol@test.com');
        await passwordInput.sendKeys('lol123');

        console.log('Submitting the form...');
        await submitButton.click();

        // Wait for the status element to contain the expected text
        const expectedText = 'Welcome lol';
        await driver.wait(async function () {
            const status = await driver.findElement(By.id('status'));
            const statusText = await status.getText();
            return statusText.includes(expectedText);
        }, 10000, 'Timeout waiting for status element to contain expected text');

        // Assert the status text
        const status = await driver.findElement(By.id('status'));
        const statusText = await status.getText();
        console.log('Status Text:', statusText);
        assert(statusText.includes(expectedText));

    });
});
