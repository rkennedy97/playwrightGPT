// pages/purchaseItems.ts
import { Page, expect } from '@playwright/test';
import { gptFill, gptClick, gptSelect } from '../utilities/Common/commonControls/gptLib';

export class PurchaseItems {
  constructor(private page: Page) {}

  async login(username: string, password: string) {
    await this.page.goto('https://www.saucedemo.com/');
    await this.page.waitForTimeout(1000);

    const htmlSnippet = await this.page.content();
    await gptFill(this.page, 'fill username', htmlSnippet, username);
    await gptFill(this.page, 'fill password', htmlSnippet, password);
    await gptClick(
      this.page,
      'click login button The login button is an <input> element, not a <button>',
      htmlSnippet
    );

    // Verify we're on the products page
    await expect(this.page.locator('.title')).toHaveText('Products');
  }

  async sortProductsLowToHigh() {
    const htmlSnippet = await this.page.content();
    await gptSelect(this.page, "select 'Price (low to high)'. The sort control is a <select> element.", htmlSnippet, 'Price (low to high)');
    await this.page.waitForTimeout(1000);
  }

  async addToCart() {
    const htmlSnippet = await this.page.content();
    // Add items
    await gptClick(this.page, 'click add to cart for Sauce Labs Bike Light', htmlSnippet);
    await gptClick(this.page, 'click add to cart for Sauce Labs Backpack', htmlSnippet);

    // Go to cart
    await gptClick(this.page, 'click shopping cart link', htmlSnippet);

    // Confirm items in cart
    await expect(this.page.locator('.cart_item')).toHaveCount(2);
  }

  async checkout(firstName: string, lastName: string, postalCode: string) {
    // Checkout button
    let htmlSnippet = await this.page.content();
    await gptClick(this.page, 'click checkout button', htmlSnippet);

    // Fill checkout info
    htmlSnippet = await this.page.content();
    await gptFill(this.page, 'fill first name', htmlSnippet, firstName);
    await gptFill(this.page, 'fill last name', htmlSnippet, lastName);
    await gptFill(this.page, 'fill postal code', htmlSnippet, postalCode);

    await gptClick(
      this.page,
      'click continue button The continue button is an <input> element, not a <button>',
      htmlSnippet
    );

    // Finish
    htmlSnippet = await this.page.content();
    await gptClick(this.page, 'click finish button', htmlSnippet);

    // Confirmation
    htmlSnippet = await this.page.content();
    const confirmationPrompt = "find order confirmation message element with text 'Thank you for your order!'";
    // We can just do a normal waitForSelector, or do GPT-based again:
    await gptClick(this.page, confirmationPrompt, htmlSnippet); 
    // ^ If you want to 'check' it. 
    // Alternatively, if it's a static .complete-text or .pony_express:
    // await expect(this.page.locator('.complete-header')).toHaveText('Thank you for your order!');
  }
}
