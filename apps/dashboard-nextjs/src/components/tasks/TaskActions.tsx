                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="quick-hours">Hours</Label>
                    <Input
                      id="quick-hours"
                      type="number"
                      step="0.5"
                      min="0"
                      value={completionData.actual_hours}
                      onChange={(e) => setCompletionData({
                        ...completionData,
                        actual_hours: parseFloat(e.target.value) || 0
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quick-rating">Rating</Label>
                    <Select
                      value={completionData.success_rating?.toString()}
                      onValueChange={(value) => setCompletionData({
                        ...completionData,
                        success_rating: parseInt(value)
                      })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={handleQuickComplete}
                    disabled={loading || !completionData.completion_notes.trim()}
                    className="flex-1"
                  >
                    {loading ? 'Completing...' : 'Complete'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setQuickCompleteOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        
        <Button variant="ghost" size="sm" onClick={onViewDetails} className="h-8 w-8 p-0">
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Quick Complete */}
      {task.status !== 'completed' && (
        <Popover open={quickCompleteOpen} onOpenChange={setQuickCompleteOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">Complete Task</h4>
                <p className="text-sm text-gray-600">"{task.title}"</p>
              </div>
              <div>
                <Label htmlFor="completion-notes">Completion Notes *</Label>
                <Textarea
                  id="completion-notes"
                  placeholder="Describe what was accomplished..."
                  value={completionData.completion_notes}
                  onChange={(e) => setCompletionData({
                    ...completionData,
                    completion_notes: e.target.value
                  })}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="actual-hours">Actual Hours</Label>
                  <Input
                    id="actual-hours"
                    type="number"
                    step="0.5"
                    min="0"
                    value={completionData.actual_hours}
                    onChange={(e) => setCompletionData({
                      ...completionData,
                      actual_hours: parseFloat(e.target.value) || 0
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="actual-value">Value ($)</Label>
                  <Input
                    id="actual-value"
                    type="number"
                    min="0"
                    value={completionData.actual_value}
                    onChange={(e) => setCompletionData({
                      ...completionData,
                      actual_value: parseFloat(e.target.value) || 0
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="success-rating">Success Rating</Label>
                <Select
                  value={completionData.success_rating?.toString()}
                  onValueChange={(value) => setCompletionData({
                    ...completionData,
                    success_rating: parseInt(value)
                  })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Poor</SelectItem>
                    <SelectItem value="2">2 - Fair</SelectItem>
                    <SelectItem value="3">3 - Good</SelectItem>
                    <SelectItem value="4">4 - Very Good</SelectItem>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleQuickComplete}
                  disabled={loading || !completionData.completion_notes.trim()}
                  className="flex-1"
                >
                  {loading ? 'Completing...' : 'Complete Task'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setQuickCompleteOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* View Details */}
      <Button variant="outline" size="sm" onClick={onViewDetails}>
        <Eye className="h-4 w-4 mr-2" />
        View Details
      </Button>

      {/* Edit Task */}
      <Button variant="outline" size="sm">
        <Edit3 className="h-4 w-4 mr-2" />
        Edit
      </Button>

      {/* Email Task */}
      <Button variant="outline" size="sm" onClick={handleEmailTask}>
        <Mail className="h-4 w-4 mr-2" />
        Email
      </Button>

      {/* Print Task */}
      <Button variant="outline" size="sm" onClick={handlePrintTask}>
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>

      {/* Delete Task */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteTask}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="quick-hours">Hours</Label>
                    <Input
                      id="quick-hours"
                      type="number"
                      step="0.5"
                      value={completionData.actual_hours}
                      onChange={(e) => setCompletionData({
                        ...completionData,
                        actual_hours: parseFloat(e.target.value) || 0
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quick-rating">Rating</Label>
                    <Select
                      value={completionData.success_rating?.toString()}
                      onValueChange={(value) => setCompletionData({
                        ...completionData,
                        success_rating: parseInt(value)
                      })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickCompleteOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleQuickComplete}
                    disabled={loading || !completionData.completion_notes.trim()}
                  >
                    {loading ? 'Completing...' : 'Complete'}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onViewDetails}>
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* View Details Button */}
      <Button variant="outline" size="sm" onClick={onViewDetails}>
        <Eye className="h-4 w-4 mr-2" />
        View Details
      </Button>

      {/* Complete Task Button */}
      {task.status !== 'completed' && (
        <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Task</DialogTitle>
              <DialogDescription>
                Mark "{task.title}" as complete and provide outcome details.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="completion_notes">Completion Notes *</Label>
                <Textarea
                  id="completion_notes"
                  placeholder="Describe what was accomplished..."
                  value={completionData.completion_notes}
                  onChange={(e) => setCompletionData({
                    ...completionData,
                    completion_notes: e.target.value
                  })}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="actual_hours">Actual Hours</Label>
                  <Input
                    id="actual_hours"
                    type="number"
                    step="0.5"
                    min="0"
                    value={completionData.actual_hours}
                    onChange={(e) => setCompletionData({
                      ...completionData,
                      actual_hours: parseFloat(e.target.value) || 0
                    })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="actual_value">Actual Value ($)</Label>
                  <Input
                    id="actual_value"
                    type="number"
                    min="0"
                    value={completionData.actual_value}
                    onChange={(e) => setCompletionData({
                      ...completionData,
                      actual_value: parseFloat(e.target.value) || 0
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="success_rating">Success Rating</Label>
                <Select
                  value={completionData.success_rating?.toString()}
                  onValueChange={(value) => setCompletionData({
                    ...completionData,
                    success_rating: parseInt(value)
                  })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Poor</SelectItem>
                    <SelectItem value="2">2 - Fair</SelectItem>
                    <SelectItem value="3">3 - Good</SelectItem>
                    <SelectItem value="4">4 - Very Good</SelectItem>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCompleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleQuickComplete}
                disabled={loading || !completionData.completion_notes.trim()}
              >
                {loading ? 'Completing...' : 'Complete Task'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Secondary Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={handleEmailTask}>
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
        
        <Button variant="ghost" size="sm" onClick={handlePrintTask}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        
        <Button variant="ghost" size="sm">
          <Edit3 className="h-4 w-4 mr-2" />
          Edit
        </Button>

        {/* Delete Task */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Task</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{task.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteTask}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Task'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
