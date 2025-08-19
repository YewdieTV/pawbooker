import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check title
  await expect(page).toHaveTitle(/PawBooker/);
  
  // Check main heading
  await expect(page.getByRole('heading', { name: /Professional Dog Care Made Simple/i })).toBeVisible();
  
  // Check navigation
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Services' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Availability' })).toBeVisible();
  
  // Check main CTA button
  await expect(page.getByRole('link', { name: /Book with AI Assistant/i })).toBeVisible();
});

test('navigation works correctly', async ({ page }) => {
  await page.goto('/');
  
  // Navigate to services
  await page.getByRole('link', { name: 'Services' }).click();
  await expect(page).toHaveURL('/services');
  await expect(page.getByRole('heading', { name: /Professional Dog Care Services/i })).toBeVisible();
  
  // Navigate to availability
  await page.getByRole('link', { name: 'Availability' }).click();
  await expect(page).toHaveURL('/availability');
  await expect(page.getByRole('heading', { name: /Check Availability/i })).toBeVisible();
  
  // Navigate to AI booking
  await page.goto('/');
  await page.getByRole('link', { name: /Book with AI Assistant/i }).first().click();
  await expect(page).toHaveURL('/book-with-assistant');
  await expect(page.getByRole('heading', { name: /Book with AI Assistant/i })).toBeVisible();
});

test('responsive design works', async ({ page }) => {
  // Test mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  
  // Check mobile menu button is visible
  await expect(page.getByRole('button')).toBeVisible();
  
  // Test desktop viewport
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  
  // Check desktop navigation is visible
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Services' })).toBeVisible();
});
