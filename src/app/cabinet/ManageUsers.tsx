import { useState,useEffect } from "react";

export default function ManageUsers() {
    type User = {
        id: number;
        email: string;
        role: string;
    };

    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        fetch('http://localhost:4000/api/users', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then((res) => res.json())
            .then((data: User[]) => setUsers(data)) 
            .catch((error) => console.error('Error fetching users:', error));
    }, []);

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            await fetch(`http://localhost:4000/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ role: newRole }),
            });
            alert('Role updated successfully');
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );
        } catch (error) {
            console.error('Error updating role:', error);
        }
    };

    return (
        <div className="cabinet-user-tabs">
            <h3>Manage Users</h3>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        {user.email} 
                        <div className="cabinet-users-divider">
                        {user.role}
                        <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        >
                            <option value="user">User</option>
                            <option value="editor">Editor</option>
                            <option value="superadmin">Superadmin</option>
                        </select>
                        <button
                            onClick={async () => {
                                await fetch(`http://localhost:4000/api/users/${user.id}`, {
                                    method: 'DELETE',
                                    headers: {
                                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                                    },
                                });
                                setUsers((prev) => prev.filter((u) => u.id !== user.id));
                            }}
                        >
                            Delete
                        </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
