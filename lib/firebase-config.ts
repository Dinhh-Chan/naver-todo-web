// Firebase configuration for AnyF Time Manager
// This is a mock configuration - replace with your actual Firebase config

export const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "anyf-time-manager.firebaseapp.com",
  projectId: "anyf-time-manager",
  storageBucket: "anyf-time-manager.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
}

// Mock Firebase service for demonstration
export class FirebaseService {
  private static isEnabled = false // Set to true to enable Firebase
  private static mockData: any[] = []

  static async initialize() {
    if (!this.isEnabled) {
      console.log("Firebase disabled - using localStorage only")
      return
    }
    
    // In a real implementation, this would initialize Firebase
    console.log("Firebase initialized")
  }

  static async saveTasks(tasks: any[]) {
    if (!this.isEnabled) {
      return
    }
    
    // Mock save to Firebase
    this.mockData = [...tasks]
    console.log("Tasks saved to Firebase:", tasks.length)
  }

  static async loadTasks() {
    if (!this.isEnabled) {
      return []
    }
    
    // Mock load from Firebase
    console.log("Tasks loaded from Firebase:", this.mockData.length)
    return this.mockData
  }

  static async syncWithLocalStorage() {
    if (!this.isEnabled) {
      return
    }
    
    // Mock sync operation
    console.log("Syncing with Firebase...")
  }
}

