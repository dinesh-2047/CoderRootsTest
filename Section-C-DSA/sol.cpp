// Problem: First Unique Character
// Given a string s, find the index of the first non-repeating character in it. If every character
// repeats, return -1.
// Examples:
// ● Example 1:
// ○ Input: s = "leetcode"
// ○ Output: 0
// ● Example 2:
// ○ Input: s = "loveleetcode"
// ○ Output: 2
// ● Example 3:
// ○ Input: s = "aabb"
// ○ Output: -1

// Constraints:
// ● 1 ≤ lengthofs ≤ 10
// 5

// ● String contains only lowercase English letters.



#include<bits/stdc++.h> 
using namespace std; 



int main(){
    string s; 
    cin>> s; 

    unordered_map<char, int> mp ; 
    for(auto &ch : s){
        mp[ch]++;
    }

    for(int i = 0 ; i < s.length(); i++){
        if(mp[s[i]] == 1){
            cout<<i<<endl; 
            return 0 ; 
        }
    }
    cout<<-1<<endl; 
    return 0 ; 

}