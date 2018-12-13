# Here go your api methods.


@auth.requires_signature()
def add_post():
    post_id = db.post.insert(
        post_title=request.vars.post_title,
        post_total=request.vars.post_total,
        post_category=request.vars.post_category,
        post_expense=request.vars.post_expense,
        post_budget=request.vars.post_budget,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(post_id=post_id))


def delete_db():
    db(db.post.id > 0).delete()
    return "ok"

def get_post_list():
    results = []
    if auth.user is None:
        # Not logged in.
        rows = db().select(db.post.ALL, orderby=~db.post.post_time)
        for row in rows:
            results.append(dict(
                id=row.id,
                post_title=row.post_title,
                post_total=row.post_total,
                post_author=row.post_author,
                post_category=row.post_category,
                post_expense = row.post_expense,
                post_budget = row.post_budget,
            ))
    else:
        # Logged in.
        rows = db().select(db.post.ALL, db.user_like.ALL, db.user_star.ALL,
                            left=[
                                db.user_like.on((db.user_like.post_id == db.post.id) & (db.user_like.user_email == auth.user.email)),
                                db.user_star.on((db.user_star.post_id == db.post.id) & (db.user_star.user_email == auth.user.email)),
                            ],
                            orderby=~db.post.post_time)
        for row in rows:
            results.append(dict(
                id=row.post.id,
                post_title=row.post.post_title,
                post_total=row.post.post_total,
                post_author=row.post.post_author,
                post_category=row.post.post_category,
                post_expense=row.post.post_expense,
                post_budget=row.post.post_budget,

            ))
    # For homogeneity, we always return a dictionary.
    return response.json(dict(post_list=results))



