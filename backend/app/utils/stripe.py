# import os
# import stripe
# from dotenv import load_dotenv

# load_dotenv()

# stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# def create_checkout_session(booking_id: int, amount: int, currency: str = "usd"):
#     session = stripe.checkout.Session.create(
#         payment_method_types=["card"],
#         line_items=[{
#             "price_data": {
#                 "currency": currency,
#                 "product_data": {
#                     "name": f"Booking #{booking_id}",
#                 },
#                 "unit_amount": amount,
#             },
#             "quantity": 1,
#         }],
#         mode="payment",
#         success_url=f"http://localhost:3000/payment-success?booking_id={booking_id}",
#         cancel_url=f"http://localhost:3000/payment-cancelled?booking_id={booking_id}",
#         metadata={"booking_id": booking_id},
#     )
#     return session
