'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

type Child = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bio?: string;
  needs?: string[];
  interests?: string[];
  photoUrl?: string;
  isAdopted: boolean;
};

export function ChildrenSettings() {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [formData, setFormData] = useState<Partial<Child>>({
    firstName: '',
    lastName: '',
    dateOfBirth: new Date().toISOString().split('T')[0],
    gender: 'MALE',
    bio: '',
    needs: [],
    interests: [],
    isAdopted: false,
  });

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/orphanage/children');
      if (!response.ok) throw new Error('Failed to fetch children');
      const data = await response.json();
      setChildren(data.data || []);
    } catch (error) {
      console.error('Error fetching children:', error);
      toast.error('Failed to load children');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingChild 
        ? `/api/orphanage/children/${editingChild.id}`
        : '/api/orphanage/children';
      
      const method = editingChild ? 'PUT' : 'POST';
      
      // Prepare the data to be sent
      const dataToSend = { ...formData };
      
      // Debug: Log the form data before processing
      console.log('Form data before processing:', JSON.parse(JSON.stringify(dataToSend)));
      
      // Convert date to ISO string if it exists
      if (dataToSend.dateOfBirth) {
        try {
          console.log('Date of birth before conversion:', dataToSend.dateOfBirth, typeof dataToSend.dateOfBirth);
          const dateValue = new Date(dataToSend.dateOfBirth);
          if (isNaN(dateValue.getTime())) {
            console.error('Invalid date value:', dataToSend.dateOfBirth);
            throw new Error('Invalid date of birth');
          }
          dataToSend.dateOfBirth = dateValue.toISOString();
          console.log('Converted date of birth to ISO string:', dataToSend.dateOfBirth);
        } catch (error) {
          console.error('Error processing date:', error);
          throw new Error('Invalid date format. Please use YYYY-MM-DD');
        }
      }
      
      // Handle file upload for POST requests
      if (method === 'POST' && formData.photoUrl && typeof formData.photoUrl === 'object' && 'name' in formData.photoUrl) {
        const formDataToSend = new FormData();
        
        // Add all fields to form data
        Object.entries(dataToSend).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              formDataToSend.append(key, value.join(','));
            } else if (value && typeof value === 'object' && 'name' in value && 'size' in value) {
              // Handle File or File-like objects
              formDataToSend.append('image', value as File);
            } else {
              formDataToSend.append(key, String(value));
            }
          }
        });
        
        const response = await fetch(url, {
          method,
          body: formDataToSend,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to save child');
        }
      } else {
        // For PUT requests or when there's no file to upload
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to save child');
        }
      }
      
      toast.success(editingChild ? 'Child updated successfully' : 'Child added successfully');
      setIsDialogOpen(false);
      fetchChildren();
      resetForm();
    } catch (error) {
      console.error('Error saving child:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save child');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this child? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(id);
      const response = await fetch(`/api/orphanage/children/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete child');
      
      toast.success('Child deleted successfully');
      fetchChildren();
    } catch (error) {
      console.error('Error deleting child:', error);
      toast.error('Failed to delete child');
    } finally {
      setIsDeleting(null);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: new Date().toISOString().split('T')[0],
      gender: 'MALE',
      bio: '',
      needs: [],
      interests: [],
      isAdopted: false,
    });
    setEditingChild(null);
  };

  const openEditDialog = (child: Child) => {
    setEditingChild(child);
    setFormData({
      ...child,
      dateOfBirth: child.dateOfBirth.split('T')[0],
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Manage Children</h2>
          <p className="text-sm text-muted-foreground">
            View and manage children in your orphanage
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Child
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No children found. Add a child to get started.
                </TableCell>
              </TableRow>
            ) : (
              children.map((child) => (
                <TableRow key={child.id}>
                  <TableCell className="font-medium">{`${child.firstName} ${child.lastName}`}</TableCell>
                  <TableCell>
                    {new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear()} years
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{child.gender.toLowerCase()}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      child.isAdopted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {child.isAdopted ? 'Adopted' : 'Available'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(child)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(child.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      disabled={isDeleting === child.id}
                    >
                      {isDeleting === child.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingChild ? 'Edit Child' : 'Add New Child'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <Select
                  value={formData.gender || 'MALE'}
                  onValueChange={(value) => handleSelectChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                name="bio"
                value={formData.bio || ''}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Special Needs (comma separated)</label>
                <Input
                  name="needs"
                  value={formData.needs?.join(', ') || ''}
                  onChange={(e) => {
                    const needs = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                    setFormData(prev => ({
                      ...prev,
                      needs
                    }));
                  }}
                  placeholder="e.g., Special education, Physical therapy"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Interests (comma separated)</label>
                <Input
                  name="interests"
                  value={formData.interests?.join(', ') || ''}
                  onChange={(e) => {
                    const interests = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                    setFormData(prev => ({
                      ...prev,
                      interests
                    }));
                  }}
                  placeholder="e.g., Drawing, Soccer, Music"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingChild ? 'Update Child' : 'Add Child'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
