GET
/api/v1/school-rating-admin/permissions/
school_rating_admin_permissions_list
[
{
"id": 0,
"name": "string",
"codename": "string"
}
]

GET
/api/v1/school-rating-admin/permissions/{id}/
school_rating_admin_permissions_retrieve
{
"id": 0,
"name": "string",
"codename": "string"
}

GET
/api/v1/school-rating-admin/roles/
school_rating_admin_roles_list
{
"count": 123,
"next": "http://api.example.org/accounts/?offset=400&limit=100",
"previous": "http://api.example.org/accounts/?offset=200&limit=100",
"results": [
{
"id": 0,
"name": "string",
"permissions": [
{
"id": 0,
"name": "string",
"codename": "string"
}
]
}
]
}

POST
/api/v1/school-rating-admin/roles/
school_rating_admin_roles_create
Example Value
Schema
{
"name": "string",
"permission_ids": [
0
]
}

Response Example Value
Schema
{
"id": 0,
"name": "string",
"permissions": [
{
"id": 0,
"name": "string",
"codename": "string"
}
]
}

GET
/api/v1/school-rating-admin/roles/{id}/
school_rating_admin_roles_retrieve
{
"id": 0,
"name": "string",
"permissions": [
{
"id": 0,
"name": "string",
"codename": "string"
}
]
}

PUT
/api/v1/school-rating-admin/roles/{id}/
school_rating_admin_roles_update
Example Value
Schema
{
"name": "string",
"permission_ids": [
0
]
}

Response Example Value
Schema
{
"id": 0,
"name": "string",
"permissions": [
{
"id": 0,
"name": "string",
"codename": "string"
}
]
}

PATCH
/api/v1/school-rating-admin/roles/{id}/
school_rating_admin_roles_partial_update
Example Value
Schema
{
"name": "string",
"permission_ids": [
0
]
}

Response Example Value
Schema
{
"id": 0,
"name": "string",
"permissions": [
{
"id": 0,
"name": "string",
"codename": "string"
}
]
}

DELETE
/api/v1/school-rating-admin/roles/{id}/
school_rating_admin_roles_destroy

No Response

GET
/api/v1/school-rating-admin/users/
school_rating_admin_users_list

Name Description
limit
integer
(query)
Number of results to return per page.

limit
offset
integer
(query)
The initial index from which to return the results.

offset
school_profile**district
integer
(query)
school_profile**district
school_profile**organization
integer
(query)
school_profile**organization
school_profile**position
string
(query)
school_profile**position
search
string
(query)
A search term.

search

{
"count": 123,
"next": "http://api.example.org/accounts/?offset=400&limit=100",
"previous": "http://api.example.org/accounts/?offset=200&limit=100",
"results": [
{
"id": 0,
"username": "p64pjO3-rdQzuMI_tWK5DVR7Z3kR+cN@1X4",
"first_name": "string",
"last_name": "string",
"patronymic": "string",
"district": "string",
"organization_name": "string",
"position": "string",
"date_joined": "2025-10-12T10:10:48.311Z",
"status": "string",
"roles": [
"string"
]
}
]
}

POST
/api/v1/school-rating-admin/users/
school_rating_admin_users_create
Example Value
Schema
{
"username": "Ao4DC6G8-UhFYX-QBTNbloOI1qCi88mG7B0bu1_bOwsY1Lv4OR51F+.@A0+g2N209AZS",
"password": "string",
"first_name": "string",
"last_name": "string",
"email": "user@example.com",
"school_profile": {
"patronymic": "string",
"birth_date": "2025-10-12",
"district": 0,
"organization": 2147483647,
"department": "string",
"position": "string",
"status": "active"
},
"roles": [
0
]
}

Response Example Value
Schema
{
"id": 0,
"username": "3U5-9wbfUe6JP",
"first_name": "string",
"last_name": "string",
"email": "user@example.com",
"school_profile": {
"patronymic": "string",
"birth_date": "2025-10-12",
"district": 0,
"organization": 2147483647,
"department": "string",
"position": "string",
"status": "active"
},
"roles": [
0
]
}

GET
/api/v1/school-rating-admin/users/{id}/
school_rating_admin_users_retrieve
{
"id": 0,
"username": "@lWljhsxGoNnrSH9nGqZwWlmvfnuFMsN3zU1V2-NR7-jKTLpYufAQqm",
"first_name": "string",
"last_name": "string",
"email": "user@example.com",
"school_profile": {
"patronymic": "string",
"birth_date": "2025-10-12",
"district": 0,
"organization": 2147483647,
"department": "string",
"position": "string",
"status": "active"
},
"roles": [
0
]
}

PUT
/api/v1/school-rating-admin/users/{id}/
school_rating_admin_users_update
{
"username": "bp12-ieS2gtuR0UTO6cJKudbU_Jo_rU.L@YGm_P-INyw8b3M@NDtqClYlRCg1Fiv55@Ru6L5-.cN.fQN",
"password": "string",
"first_name": "string",
"last_name": "string",
"email": "user@example.com",
"school_profile": {
"patronymic": "string",
"birth_date": "2025-10-12",
"district": 0,
"organization": 2147483647,
"department": "string",
"position": "string",
"status": "active"
},
"roles": [
0
]
}

PATCH
/api/v1/school-rating-admin/users/{id}/
school_rating_admin_users_partial_update
Example Value
Schema
{
"username": "fK3UCUJL4BCRJZtP8H1CAJpFNR8Db95PbMXShEUvAz7-cPupKlsRsX9rqdk18vFWFLVakSIh_v",
"password": "string",
"first_name": "string",
"last_name": "string",
"email": "user@example.com",
"school_profile": {
"patronymic": "string",
"birth_date": "2025-10-12",
"district": 0,
"organization": 2147483647,
"department": "string",
"position": "string",
"status": "active"
},
"roles": [
0
]
}

Response Example Value
Schema
{
"id": 0,
"username": "tPnDGXZMZ@ml7mQl2clHySFx_C-EJI20M4E3wfCup@YT@TnbHvv.fe",
"first_name": "string",
"last_name": "string",
"email": "user@example.com",
"school_profile": {
"patronymic": "string",
"birth_date": "2025-10-12",
"district": 0,
"organization": 2147483647,
"department": "string",
"position": "string",
"status": "active"
},
"roles": [
0
]
}

DELETE
/api/v1/school-rating-admin/users/{id}/
No response body
