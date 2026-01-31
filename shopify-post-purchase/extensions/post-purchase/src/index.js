import {
  extend,
  BlockStack,
  Text,
  Heading,
  Banner,
  Button
} from '@shopify/checkout-ui-extensions';

// Extension renders right after purchase
extend('Checkout::PostPurchase::ShouldRender', async ({ storage }) => {
  // Always show the extension
  return { render: true };
});

extend('Checkout::PostPurchase::Render', (root, { storage, inputData, done }) => {
  const shop = inputData.shop?.domain || 'example-store.myshopify.com';
  
  // Set default message
  let customMessage = "Thank you for your purchase! You'll receive a special discount code via email for your next order.";
  
  // Fetch custom message from backend
  // Note: In a real Shopify extension, you'd use metafields or app proxy
  // For this demo, we'll use a hardcoded message that matches what's in the DB
  
  // Alternatively, you could fetch from your backend (requires proper CORS setup)
  /*
  fetch(`https://your-app-url.com/api/extension/message?shop=${shop}`)
    .then(response => response.json())
    .then(data => {
      customMessage = data.message;
      render();
    })
    .catch(error => {
      console.error('Failed to fetch message:', error);
      render();
    });
  */
  
  const render = () => {
    root.appendChild(
      root.createComponent(
        BlockStack,
        { spacing: 'loose' },
        [
          // Thank you heading
          root.createComponent(
            Heading,
            { level: 1 },
            'Thank you for your order!'
          ),
          
          // Custom message banner
          root.createComponent(
            Banner,
            { status: 'success' },
            root.createComponent(
              Text,
              { size: 'medium' },
              customMessage
            )
          ),
          
          // Continue shopping button
          root.createComponent(
            Button,
            {
              onPress: () => done()
            },
            'Continue Shopping'
          )
        ]
      )
    );
  };
  
  render();
});