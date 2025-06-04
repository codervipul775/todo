import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, TextInput, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { colors, spacing, typography, shadows } from '../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, type DocumentData } from "firebase/firestore";

interface Todo {
  id: string;
  text: string;
}

const TodoScreen: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state for fetching tasks
  const { user, loading: authLoading, logout, firebaseApp } = useAuth(); // Use a different name for auth loading

  // Fetch tasks from Firestore on component mount and when user changes
  useEffect(() => {
    // Only attempt to fetch if user is logged in and auth is not loading
    if (!user || authLoading || !firebaseApp) {
      setTodos([]);
      setLoading(false);
      return;
    }

    const db = getFirestore(firebaseApp);
    const todosCollectionRef = collection(db, 'users', user.uid, 'todos');
    const q = query(todosCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todos: Todo[] = [];
      querySnapshot.forEach(documentSnapshot => {
        todos.push({
          id: documentSnapshot.id,
          text: (documentSnapshot.data() as DocumentData).text,
        });
      });
      setTodos(todos);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching todos:', error);
      setLoading(false);
    });

    // Unsubscribe from events when no longer in use
    return () => unsubscribe();
  }, [user, authLoading, firebaseApp]); // Refetch when user, authLoading, or firebaseApp changes

  const addTodo = async () => {
    if (text.trim() && user && firebaseApp) {
      try {
        const db = getFirestore(firebaseApp);
        await addDoc(collection(db, 'users', user.uid, 'todos'), {
            text: text.trim(),
            createdAt: serverTimestamp(),
          });
        setText('');
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    }
  };

  const removeTodo = async (id: string) => {
    if (user && firebaseApp) {
      try {
        const db = getFirestore(firebaseApp);
        await deleteDoc(doc(db, 'users', user.uid, 'todos', id));
      } catch (error) {
        console.error('Error removing todo:', error);
      }
    }
  };

  const startEditing = (item: Todo) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEditing = async (id: string) => {
    if (editText.trim() && user && firebaseApp) {
      try {
        const db = getFirestore(firebaseApp);
        await updateDoc(doc(db, 'users', user.uid, 'todos', id), {
            text: editText.trim(),
          });
        setEditingId(null);
        setEditText('');
      } catch (error) {
        console.error('Error saving todo:', error);
      }
    }
  };

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <View style={styles.todoItem}>
      {editingId === item.id ? (
        <View style={styles.editInputContainer}>
          <TextInput
            style={styles.editInput}
            value={editText}
            onChangeText={setEditText}
            autoFocus
          />
          <CustomButton title="Save" onPress={() => saveEditing(item.id)} variant="success" style={styles.editButton} textStyle={styles.editButtonText} />
          <CustomButton title="Cancel" onPress={cancelEditing} variant="outline" style={styles.editButton} textStyle={styles.editButtonText} />
        </View>
      ) : (
        <View style={styles.todoTextContainer}>
           <Text style={styles.todoText}>{item.text}</Text>
        </View>
      )}
      
      {editingId !== item.id && (
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Edit"
            onPress={() => startEditing(item)}
            variant="secondary"
            style={styles.actionButton}
          />
          <CustomButton
            title="Delete"
            onPress={() => removeTodo(item.id)}
            variant="error"
            style={styles.actionButton}
          />
        </View>
      )}
    </View>
  );

  // Show loading indicator if either TodoScreen is loading tasks or AuthContext is loading
  if (loading || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CustomInput
          value={text}
          onChangeText={setText}
          placeholder="Add a new task..."
          style={styles.input}
          inputStyle={styles.inputTextInput}
        />
        <CustomButton
          title="Add Task"
          onPress={addTodo}
          variant="primary"
          style={styles.addButton}
        />
      </View>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={renderTodoItem}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.footer}>
        <CustomButton
          title="Logout"
          onPress={logout}
          variant="outline"
          style={styles.logoutButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: 'center',
    ...shadows.small,
  },
  input: {
    flex: 1,
    marginBottom: 0,
    marginRight: spacing.sm,
  },
  inputTextInput: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  addButton: {
    minWidth: 100,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  todoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  todoTextContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  todoText: {
    ...typography.body,
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    minWidth: 70,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginLeft: spacing.sm,
  },
  footer: {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  logoutButton: {
    width: '100%',
  },
  editInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  editInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 4,
  },
  editButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minWidth: 60,
    marginLeft: spacing.sm,
  },
  editButtonText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body,
    color: colors.textSecondary,
  },
});

export default TodoScreen; 