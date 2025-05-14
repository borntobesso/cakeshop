curl -X GET "https://fupatisserie.hiboutik.com/api/action_links" \
  -H "Accept: application/json" \
  -u "fupatisserie@gmail.com:3GRNJVHA3YW74PIGOANE7TMZI5762Q8AHBB"
  
https://fupatisserie.hiboutik.com/docapi/



API route called with method: POST
Request body: {
  customerName: 'Soyoung Test Client',
  email: 'soyoung.jung13@gmail.com',
  phone: '0752755223',
  pickupDate: '2025-05-18',
  pickupTime: '15:30',
  items: [ { name: 'MANGO PASSION', quantity: 1, price: 30, size: '6p' } ],
  totalPrice: 30
}
Print request result: { document_printed: 1 }
 POST /api/notifications 200 in 1932ms