import { test, expect } from '@playwright/test';

test('AI booking chat interface loads', async ({ page }) => {
  await page.goto('/book-with-assistant');
  
  // Check page title
  await expect(page.getByRole('heading', { name: /Book with AI Assistant/i })).toBeVisible();
  
  // Check chat interface
  await expect(page.getByText(/PawBooker AI Assistant/i)).toBeVisible();
  
  // Check initial AI message
  await expect(page.getByText(/Hi! I'm PawBooker AI/i)).toBeVisible();
  
  // Check input field
  await expect(page.getByPlaceholder(/Type your message/i)).toBeVisible();
  
  // Check send button
  await expect(page.getByRole('button').filter({ hasText: /send/i })).toBeVisible();
});

test('AI chat accepts user input', async ({ page }) => {
  await page.goto('/book-with-assistant');
  
  const messageInput = page.getByPlaceholder(/Type your message/i);
  const sendButton = page.getByRole('button').filter({ hasText: /send/i });
  
  // Type a message
  await messageInput.fill('Hello, I need help booking a service');
  
  // Send button should be enabled
  await expect(sendButton).toBeEnabled();
  
  // Send the message
  await sendButton.click();
  
  // Message should appear in chat
  await expect(page.getByText('Hello, I need help booking a service')).toBeVisible();
  
  // Input should be cleared
  await expect(messageInput).toHaveValue('');
});

test('how it works section is visible', async ({ page }) => {
  await page.goto('/book-with-assistant');
  
  // Check features are displayed
  await expect(page.getByText(/Natural Conversation/i)).toBeVisible();
  await expect(page.getByText(/Smart Scheduling/i)).toBeVisible();
  await expect(page.getByText(/Pet-Focused/i)).toBeVisible();
  await expect(page.getByText(/Instant Booking/i)).toBeVisible();
  
  // Check quick start tips
  await expect(page.getByText(/Try saying/i)).toBeVisible();
  await expect(page.getByText(/I need boarding for my Golden Retriever/i)).toBeVisible();
});
