import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper } from '../../utils/auth';

let authenticatedRequest: APIRequestContext;
let recipientId: number;
let createdNotificationId: number;
const ts = Date['now']();

test.beforeAll(async ({ playwright }) => {
    authenticatedRequest = await AuthHelper.createAuthenticatedRequest(playwright);

    // Step 1: Get recipients to find the admin user ID
    const recipientsResponse = await authenticatedRequest.get('/pimcore-studio/api/notifications/recipients');
    expect([200, 403]).toContain(recipientsResponse.status());

    if (recipientsResponse.status() === 200) {
        const recipientsData = await recipientsResponse.json();
        expect(recipientsData).toHaveProperty('items');
        expect(Array.isArray(recipientsData.items)).toBe(true);

        // Use the first recipient (should be admin)
        if (recipientsData.items.length > 0) {
            recipientId = recipientsData.items[0].id;
        }
    }

    // Step 2: Send a notification to admin (if we have a recipient)
    if (recipientId) {
        const sendResponse = await authenticatedRequest.post('/pimcore-studio/api/notifications/send', {
            data: {
                recipientId: recipientId,
                title: `Test Notification ${ts}`,
                message: `Test message created at ${ts}`
            }
        });
        expect([200, 403]).toContain(sendResponse.status());

        if (sendResponse.status() === 200) {
            // Step 3: List notifications to find the created one
            const listResponse = await authenticatedRequest.post('/pimcore-studio/api/notifications', {
                data: {
                    filters: {
                        page: 1,
                        pageSize: 50
                    }
                }
            });

            if (listResponse.status() === 200) {
                const listData = await listResponse.json();
                if (listData.items && listData.items.length > 0) {
                    // Find the notification we just sent by title
                    const created = listData.items.find(
                        (item: { title: string; id: number }) => item.title === `Test Notification ${ts}`
                    );
                    if (created) {
                        createdNotificationId = created.id;
                    } else {
                        // Fall back to the most recent one
                        createdNotificationId = listData.items[0].id;
                    }
                }
            }
        }
    }
});

test.afterAll(async () => {
    // Clean up: delete all user notifications
    try {
        await authenticatedRequest.delete('/pimcore-studio/api/notifications');
    } catch (_) {}
    await AuthHelper.disposeAuthenticatedRequest(authenticatedRequest);
});

// ---- Unread Count ----

test('GetUnreadNotificationsCount', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/notifications/unread-count');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('unreadNotificationsCount');
    expect(typeof data.unreadNotificationsCount).toBe('number');
    expect(data.unreadNotificationsCount).toBeGreaterThanOrEqual(0);
});

// ---- Recipients ----

test('GetNotificationRecipients', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/notifications/recipients');
    expect([200, 403]).toContain(response.status());

    if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('totalItems');
        expect(data).toHaveProperty('items');
        expect(typeof data.totalItems).toBe('number');
        expect(Array.isArray(data.items)).toBe(true);

        if (data.items.length > 0) {
            const firstRecipient = data.items[0];
            expect(firstRecipient).toHaveProperty('id');
            expect(firstRecipient).toHaveProperty('recipientName');
            expect(typeof firstRecipient.id).toBe('number');
            expect(typeof firstRecipient.recipientName).toBe('string');
        }
    }
});

// ---- Send Notification ----

test('SendNotificationToRecipient', async () => {
    if (!recipientId) {
        test.skip();
        return;
    }

    const response = await authenticatedRequest.post('/pimcore-studio/api/notifications/send', {
        data: {
            recipientId: recipientId,
            title: `Send Test ${ts}`,
            message: `Message body for send test at ${ts}`
        }
    });
    expect([200, 403]).toContain(response.status());
});

test('SendNotificationWithInvalidRecipient', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/notifications/send', {
        data: {
            recipientId: 999999,
            title: `Invalid Recipient Test ${ts}`,
            message: 'This should fail'
        }
    });
    expect([400, 403, 404, 422]).toContain(response.status());
});

test('SendNotificationMissingRequiredFields', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/notifications/send', {
        data: {
            recipientId: recipientId ?? 1
            // missing title and message
        }
    });
    expect([400, 422]).toContain(response.status());
});

// ---- List Notifications ----

test('GetPaginatedNotifications', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/notifications', {
        data: {
            filters: {
                page: 1,
                pageSize: 25
            }
        }
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');
    expect(typeof data.totalItems).toBe('number');
    expect(Array.isArray(data.items)).toBe(true);
});

test('GetPaginatedNotificationsFirstPageStructure', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/notifications', {
        data: {
            filters: {
                page: 1,
                pageSize: 10
            }
        }
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('items');

    if (data.items.length > 0) {
        const item = data.items[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('read');
        expect(item).toHaveProperty('creationDate');
        expect(typeof item.id).toBe('number');
        expect(typeof item.read).toBe('boolean');
    }
});

test('GetPaginatedNotificationsEmptyFilters', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/notifications', {
        data: {
            filters: {}
        }
    });
    expect([200, 422]).toContain(response.status());
});

// ---- Get Single Notification ----

test('GetNotificationById', async () => {
    if (!createdNotificationId) {
        test.skip();
        return;
    }

    const response = await authenticatedRequest.get(`/pimcore-studio/api/notifications/${createdNotificationId}`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('type');
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('read');
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('creationDate');
    expect(data.id).toBe(createdNotificationId);
});

test('GetNotificationByInvalidIdReturnsError', async () => {
    const response = await authenticatedRequest.get('/pimcore-studio/api/notifications/999999');
    expect([404, 422]).toContain(response.status());
});

// ---- Mark as Read ----

test('MarkNotificationAsRead', async () => {
    if (!createdNotificationId) {
        test.skip();
        return;
    }

    const response = await authenticatedRequest.post(`/pimcore-studio/api/notifications/${createdNotificationId}`);
    expect([200, 403]).toContain(response.status());

    if (response.status() === 200) {
        // Verify the notification is now marked as read
        const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/notifications/${createdNotificationId}`);
        expect(getResponse.status()).toBe(200);
        const data = await getResponse.json();
        expect(data.read).toBe(true);
    }
});

test('MarkNonExistentNotificationAsReadReturnsError', async () => {
    const response = await authenticatedRequest.post('/pimcore-studio/api/notifications/999999');
    expect([403, 404, 422]).toContain(response.status());
});

// ---- Delete Single Notification ----

test('DeleteNotificationById', async () => {
    if (!recipientId) {
        test.skip();
        return;
    }

    // Create a fresh notification specifically for deletion
    const sendResponse = await authenticatedRequest.post('/pimcore-studio/api/notifications/send', {
        data: {
            recipientId: recipientId,
            title: `Delete Target ${ts}`,
            message: `Notification to be deleted at ${ts}`
        }
    });

    if (sendResponse.status() !== 200) {
        test.skip();
        return;
    }

    // Find the notification we just created
    const listResponse = await authenticatedRequest.post('/pimcore-studio/api/notifications', {
        data: { filters: { page: 1, pageSize: 50 } }
    });

    expect(listResponse.status()).toBe(200);
    const listData = await listResponse.json();

    const toDelete = listData.items?.find(
        (item: { title: string; id: number }) => item.title === `Delete Target ${ts}`
    );

    if (!toDelete) {
        test.skip();
        return;
    }

    const deleteResponse = await authenticatedRequest.delete(`/pimcore-studio/api/notifications/${toDelete.id}`);
    expect([200, 403]).toContain(deleteResponse.status());

    if (deleteResponse.status() === 200) {
        // Verify it's gone
        const getResponse = await authenticatedRequest.get(`/pimcore-studio/api/notifications/${toDelete.id}`);
        expect([403, 404]).toContain(getResponse.status());
    }
});

test('DeleteNotificationByInvalidIdReturnsError', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/notifications/999999');
    expect([404, 422]).toContain(response.status());
});

// ---- Delete All Notifications ----

test('DeleteAllUserNotifications', async () => {
    const response = await authenticatedRequest.delete('/pimcore-studio/api/notifications');
    expect([200, 403]).toContain(response.status());

    if (response.status() === 200) {
        // Verify list is now empty
        const listResponse = await authenticatedRequest.post('/pimcore-studio/api/notifications', {
            data: { filters: { page: 1, pageSize: 25 } }
        });
        expect(listResponse.status()).toBe(200);
        const listData = await listResponse.json();
        expect(listData.totalItems).toBe(0);
    }
});
