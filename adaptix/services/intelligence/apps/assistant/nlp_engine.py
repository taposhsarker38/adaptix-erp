from django.db import connection
from datetime import date

class NLPEngine:
    def __init__(self, company_uuid):
        self.company_uuid = company_uuid

    def process_message(self, message):
        """
        Process the user message and return a structured response.
        """
        message = message.lower()

        # Intent: Greeting
        if any(word in message for word in ['hello', 'hi', 'hey']):
            return {
                "reply": "Hello! I am your Adaptix Business Assistant. I can help you with sales reports, inventory alerts, and staff attendance. Ask me something like 'Who are my top selling products?' or 'Is anyone late today?'"
            }

        # Intent: Top Products
        if 'top' in message and ('product' in message or 'selling' in message):
            return self._get_top_products()

        # Intent: Attendance / Staff
        if 'staff' in message or 'attendance' in message or 'late' in message or 'absent' in message:
            return self._get_staff_insights(message)

        # Intent: Sales Summary/Revenue
        if 'sales' in message or 'revenue' in message:
            return self._get_sales_summary(message)

        # Intent: Low Stock
        if 'stock' in message or 'inventory' in message or 'low' in message:
            return self._get_low_stock()

        return {
            "reply": "I didn't quite understand that. Try asking:\n- 'Show top selling products'\n- 'Is anyone late today?'\n- 'What are today's sales?'\n- 'Show me low stock items'"
        }

    def _get_top_products(self):
        """Query for top 5 selling products by quantity."""
        with connection.cursor() as cursor:
            sql = """
                SELECT oi.product_name, SUM(oi.quantity) as total_qty
                FROM pos.sales_order o
                JOIN pos.sales_orderitem oi ON o.id = oi.order_id
                WHERE o.company_uuid = %s AND o.status = 'completed'
                GROUP BY oi.product_name
                ORDER BY total_qty DESC
                LIMIT 5
            """
            try:
                cursor.execute(sql, [self.company_uuid])
                rows = cursor.fetchall()
                if not rows: return {"reply": "No sales data found yet."}
                
                reply = "Your top 5 selling products are:\n" + "\n".join([f"{i+1}. {r[0]} ({int(r[1])} units)" for i, r in enumerate(rows)])
                return {"reply": reply, "data": rows}
            except Exception as e:
                return {"reply": "Error fetching top products.", "debug": str(e)}

    def _get_staff_insights(self, message):
        """Query for late or absent staff today."""
        with connection.cursor() as cursor:
            # Table names based on app_model naming: hrms.employees_employee, hrms.attendance_attendance
            sql = """
                SELECT e.first_name, e.last_name, a.status, a.late_minutes
                FROM hrms.attendance_attendance a
                JOIN hrms.employees_employee e ON a.employee_id = e.id
                WHERE e.company_uuid = %s AND a.date = CURRENT_DATE
                AND (a.status IN ('late', 'absent') OR a.late_minutes > 0)
            """
            try:
                cursor.execute(sql, [self.company_uuid])
                rows = cursor.fetchall()
                if not rows: return {"reply": "Everyone is on time today! No late or absent staff reported."}
                
                reply = "Attendance Alerts for today:\n" + "\n".join([f"- {r[0]} {r[1]}: {r[2].capitalize()}" + (f" ({r[3]} mins late)" if r[3] > 0 else "") for r in rows])
                return {"reply": reply, "data": rows}
            except Exception as e:
                return {"reply": "I couldn't access the attendance records.", "debug": str(e)}

    def _get_sales_summary(self, message):
        """
        Query the POS schema for sales data.
        """
        # Determine timeframe (default to today)
        query_date = date.today()
        # TODO: Add logic for 'yesterday', 'this week' parsing
        
        with connection.cursor() as cursor:
            # Note: We access the 'pos' schema directly.
            # Table name is typically 'sales_order' inside 'apps/sales'.
            # Given Django's default: app_label + '_' + model_name -> 'sales_order'
            
            # Since we are in the 'intelligence' service, we need to ensure we target the 'pos' schema.
            # However, looking at the project structure, it seems we might need to confirm the schema name.
            # Assuming 'pos' schema based on standard microservice pattern in this project.
            
            # Query: Total Sales for the Company for Today, Status can be 'completed'
            sql = """
                SELECT COUNT(*), COALESCE(SUM(grand_total), 0)
                FROM pos.sales_order 
                WHERE company_uuid = %s 
                AND status = 'completed'
                AND created_at::date = %s
            """
            
            try:
                cursor.execute(sql, [self.company_uuid, query_date])
                row = cursor.fetchone()
                count = row[0]
                total = row[1]
                
                return {
                    "reply": f"Sales for today ({query_date}):\n\nTotal Orders: {count}\nTotal Revenue: ৳{total:,.2f}",
                    "data": {"count": count, "total": float(total)}
                }
            except Exception as e:
                return {
                    "reply": f"I couldn't fetch the sales data. Error: {str(e)}",
                    "debug": str(e)
                }

    def _get_low_stock(self):
        """
        Query the Inventory schema for low stock items.
        """
        with connection.cursor() as cursor:
            # Assuming 'inventory' schema and 'stocks_stock' table (app 'stocks', model 'Stock')
            
            sql = """
                SELECT p.name, s.quantity, w.name as warehouse
                FROM inventory.stocks_stock s
                JOIN inventory.products_product p ON s.product_uuid = p.id
                JOIN inventory.stocks_warehouse w ON s.warehouse_id = w.id
                WHERE s.company_uuid = %s
                AND s.quantity <= s.reorder_level
                LIMIT 5
            """
            
            try:
                # Note: This query assumes `products_product` exists. 
                # If products are in a different service/schema, this JOIN will fail unless they are in the same DB.
                # In this Single-DB setup, they are likely in 'inventory' schema too.
                
                cursor.execute(sql, [self.company_uuid])
                rows = cursor.fetchall()
                
                if not rows:
                    return {"reply": "Great news! No items are currently low on stock."}
                
                items_list = "\n".join([f"- {row[0]}: {row[1]} units ({row[2]})" for row in rows])
                
                return {
                    "reply": f"Found {len(rows)} items running low:\n\n{items_list}",
                    "data": rows
                }
            except Exception as e:
                # Fallback if table names are different (e.g. app name is different)
                return {
                    "reply": "I checked the inventory but hit a snag.",
                    "debug": str(e)
                }
