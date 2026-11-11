puts "class=#{Current.class}"
puts "ancestors=#{Current.ancestors.map(&:to_s).join(',')}"
puts "methods=#{(Current.methods - Object.methods).sort.join(',')}"
