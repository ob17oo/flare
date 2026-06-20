interface EmailTemplateProps {
  productTitle: string
  purchaseDate: string
  orderId: string | number
  price: number | string
  paymentMethod: string
  status: string
  productKey: string
  appUrl: string
}

export function getPurchaseReceiptHtml(props: EmailTemplateProps): string {
  const {
    productTitle,
    purchaseDate,
    orderId,
    price,
    paymentMethod,
    status,
    productKey,
    appUrl,
  } = props

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Спасибо за покупку во Flare!</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f9fafb;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    .header {
      background-color: #09090b;
      padding: 32px;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.05em;
      text-decoration: none;
    }
    .content {
      padding: 32px;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin-top: 0;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 15px;
      color: #4b5563;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .card {
      background-color: #f9fafb;
      border: 1px solid #f3f4f6;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .card-title {
      font-size: 12px;
      font-weight: 700;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 16px;
      margin-top: 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 14px;
    }
    .detail-row:last-child {
      margin-bottom: 0;
    }
    .detail-label {
      color: #6b7280;
    }
    .detail-value {
      color: #111827;
      font-weight: 600;
    }
    .key-container {
      background-color: #eef2ff;
      border: 1.5px dashed #6366f1;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin-bottom: 28px;
    }
    .key-label {
      font-size: 12px;
      font-weight: 700;
      color: #4f46e5;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    .key-value {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 20px;
      font-weight: 800;
      color: #1e1b4b;
      letter-spacing: 0.05em;
    }
    .button-container {
      text-align: center;
      margin-bottom: 32px;
    }
    .button {
      display: inline-block;
      background-color: #6366f1;
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 10px;
      box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
    }
    .footer {
      text-align: center;
      padding: 24px 32px;
      border-top: 1px solid #f3f4f6;
      background-color: #fafafa;
    }
    .footer-text {
      font-size: 13px;
      color: #9ca3af;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <span class="logo">FLARE</span>
      </div>
      <div class="content">
        <h2 class="title">Спасибо за покупку!</h2>
        <p class="subtitle">Ваш цифровой товар успешно приобретён. Мы рады, что вы выбрали нашу платформу.</p>
        
        <div class="card">
          <h3 class="card-title">Информация о заказе</h3>
          <div class="detail-row">
            <span class="detail-label">Название товара</span>
            <span class="detail-value">${productTitle}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Дата покупки</span>
            <span class="detail-value">${purchaseDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Номер заказа</span>
            <span class="detail-value">#${orderId}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Стоимость</span>
            <span class="detail-value">${price} ₽</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Способ оплаты</span>
            <span class="detail-value">${paymentMethod}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Статус</span>
            <span class="detail-value" style="color: #10b981;">${status}</span>
          </div>
        </div>

        <div class="key-container">
          <div class="key-label">Ваш цифровой ключ</div>
          <div class="key-value">${productKey}</div>
        </div>

        <div class="button-container">
          <a href="${appUrl}/profile/tickets" class="button" target="_blank">Перейти в личный кабинет</a>
        </div>
      </div>
      <div class="footer">
        <p class="footer-text">Спасибо, что выбрали Flare ❤️</p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}
