import psycopg2
import sys

# Database connection details
DATABASE_URL = "postgresql://social_media_x8e3_user:iKyOtjfyS7amEwOn7QXPMVjcMHbrvaEA@dpg-csnqhltumphs7386vuo0-a.oregon-postgres.render.com/social_media_x8e3"

# Function to establish database connection
def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        sys.exit(1)

# Function to delete a post
def delete_post(post_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Delete related comments first to maintain referential integrity
        cursor.execute("DELETE FROM comments WHERE post_id = %s", (post_id,))
        # Delete the post
        cursor.execute("DELETE FROM posts WHERE post_id = %s", (post_id,))
        conn.commit()
        print(f"Post with ID {post_id} and its comments have been deleted.")
    except Exception as e:
        print(f"Error deleting post: {e}")
    finally:
        cursor.close()
        conn.close()

# Function to delete a comment
def delete_comment(comment_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM comments WHERE comment_id = %s", (comment_id,))
        conn.commit()
        print(f"Comment with ID {comment_id} has been deleted.")
    except Exception as e:
        print(f"Error deleting comment: {e}")
    finally:
        cursor.close()
        conn.close()

# Command-line interface
def main():
    if len(sys.argv) < 3:
        print("Usage:")
        print("  To delete a post: python delete_post_comment.py post <post_id>")
        print("  To delete a comment: python delete_post_comment.py comment <comment_id>")
        sys.exit(1)

    action = sys.argv[1].lower()
    item_id = sys.argv[2]

    if action == "post":
        delete_post(item_id)
    elif action == "comment":
        delete_comment(item_id)
    else:
        print("Invalid action. Use 'post' or 'comment'.")
        sys.exit(1)

if __name__ == "__main__":
    main()
