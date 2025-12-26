Pod::Spec.new do |s|
  s.name         = "RCT-Folly"
  s.version      = "2024.01.22.00"
  s.summary      = "RCT-Folly alias for React Native 0.81.5"
  s.description  = <<-DESC
    RCT-Folly is provided by ReactNativeDependencies in React Native 0.81.5.
    This podspec provides an alias to ensure compatibility with libraries that depend on RCT-Folly.
  DESC
  s.homepage     = "https://github.com/facebook/react-native"
  s.license      = "MIT"
  s.author       = "Facebook"
  s.platforms    = { :ios => "12.0" }
  s.source       = { :git => "https://github.com/facebook/react-native.git", :tag => "v0.81.5" }
  
  # RCT-Folly is provided by ReactNativeDependencies
  # This is just an alias to satisfy dependency resolution
  s.dependency "ReactNativeDependencies"
  
  # Empty source files since this is just a dependency alias
  s.source_files = []
end

